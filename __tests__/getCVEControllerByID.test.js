const request = require("supertest");
const express = require("express");
const CVE = require("../models/CVE");
const router = require("../routes/cveRoutes");

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
  lastModified: new Date(1732125470607),
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
  published: new Date(591661800000),
  sourceIdentifier: "cve@mitre.org",
  vulnStatus: "Modified",
};

const app = express();
app.use(express.json());
app.use("/api", router);

jest.mock("../models/CVE.js");

describe("GET /cve/:id", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockCVEWithSerializedDates = {
    ...mockCVE,
    lastModified: mockCVE.lastModified.toISOString(),
    published: mockCVE.published.toISOString(),
  };

  test("should return CVE data when found", async () => {
    CVE.findOne.mockResolvedValue(mockCVE);
    const res = await request(app).get("/api/cve/CVE-1999-0095");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockCVEWithSerializedDates); // Compare with serialized mock data
    expect(CVE.findOne).toHaveBeenCalledWith({ cveId: "CVE-1999-0095" });
  });

  test("should return 404 if CVE is not found", async () => {
    CVE.findOne.mockResolvedValue(null);
    const res = await request(app).get("/api/cve/UNKNOWN-CVE");
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "CVE not found" });
    expect(CVE.findOne).toHaveBeenCalledWith({ cveId: "UNKNOWN-CVE" });
  });

  test("should return 500 on server error", async () => {
    CVE.findOne.mockRejectedValue(new Error("Database error"));
    const res = await request(app).get("/api/cve/CVE-1999-0095");
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: "Database error" });
    expect(CVE.findOne).toHaveBeenCalledWith({ cveId: "CVE-1999-0095" });
  });
});
