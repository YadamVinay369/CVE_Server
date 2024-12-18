const request = require("supertest");
const express = require("express");
const CVE = require("../models/CVE");
const router = express.Router();

// Mock controller function
const { getCVEControllerByYear } = require("../controllers/getCVEController");

// Use the mock controller in the router
router.get("/cve/year/:year", getCVEControllerByYear);

const app = express();
app.use(express.json());
app.use("/api", router);

jest.mock("../models/CVE.js");

// Mock data
const mockCVE = {
  cveId: "CVE-1999-0095",
  configurations: [
    {
      nodes: [
        {
          operator: "OR",
          negate: false,
          cpeMatch: [
            {
              vulnerable: true,
              criteria: "cpe:2.3:a:eric_allman:sendmail:5.58:*:*:*:*:*:*:*",
              matchCriteriaId: "1D07F493-9C8D-44A4-8652-F28B46CBA27C",
            },
          ],
        },
      ],
    },
  ],
  descriptions:
    "The debug command in Sendmail is enabled, allowing attackers to execute commands as root.",
  lastModified: new Date(1732125470607).toISOString(),
  metrics: {
    cvssMetricV2: [
      {
        source: "nvd@nist.gov",
        type: "Primary",
        cvssData: {
          version: "2.0",
          vectorString: "AV:N/AC:L/Au:N/C:C/I:C/A:C",
          baseScore: 10,
          accessVector: "NETWORK",
          accessComplexity: "LOW",
          authentication: "NONE",
          confidentialityImpact: "COMPLETE",
          integrityImpact: "COMPLETE",
          availabilityImpact: "COMPLETE",
        },
        baseSeverity: "HIGH",
        exploitabilityScore: 10,
        impactScore: 10,
        acInsufInfo: false,
        obtainAllPrivilege: true,
        obtainUserPrivilege: false,
        obtainOtherPrivilege: false,
        userInteractionRequired: false,
      },
    ],
  },
  published: new Date(591661800000).toISOString(),
  sourceIdentifier: "cve@mitre.org",
  vulnStatus: "Modified",
};

describe("GET /cve/year/:year", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return CVE data for a specific year", async () => {
    CVE.find.mockResolvedValue([mockCVE]);
    const res = await request(app).get("/api/cve/year/1988");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([mockCVE]);
    expect(CVE.find).toHaveBeenCalledWith({
      published: {
        $gte: new Date("1988-01-01"),
        $lt: new Date("1989-01-01"),
      },
    });
  });

  test("should return 404 if no CVEs are found for the year", async () => {
    CVE.find.mockResolvedValue([]);
    const res = await request(app).get("/api/cve/year/2000");
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "No such cve is available with year: 2000",
    });
    expect(CVE.find).toHaveBeenCalledWith({
      published: {
        $gte: new Date("2000-01-01"),
        $lt: new Date("2001-01-01"),
      },
    });
  });

  test("should return 500 on server error", async () => {
    CVE.find.mockRejectedValue(new Error("Database error"));
    const res = await request(app).get("/api/cve/year/1988");
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: "Database error" });
    expect(CVE.find).toHaveBeenCalledWith({
      published: {
        $gte: new Date("1988-01-01"),
        $lt: new Date("1989-01-01"),
      },
    });
  });
});
