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
  lastModified: "2024-11-20T17:57:50.607Z",
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
  published: "1988-09-30T22:30:00.000Z",
  sourceIdentifier: "cve@mitre.org",
  vulnStatus: "Modified",
};

const app = express();
app.use(express.json());
app.use("/api", router);

jest.mock("../models/CVE.js");

describe("GET /cve/score/:score", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return CVE data when found with a matching score", async () => {
    CVE.find.mockResolvedValue([mockCVE]);
    const res = await request(app).get("/api/cve/score/9");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([mockCVE]);
    expect(CVE.find).toHaveBeenCalledWith({
      $or: [
        { "metrics.cvssMetricV2.cvssData.baseScore": { $eq: 9 } },
        { "metrics.cvssMetricV3.cvssData.baseScore": { $eq: 9 } },
      ],
    });
  });

  test("should return 404 if no CVEs match the score", async () => {
    CVE.find.mockResolvedValue([]);
    const res = await request(app).get("/api/cve/score/11");
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: `No such cve is available with score: 11`,
    });
    expect(CVE.find).toHaveBeenCalledWith({
      $or: [
        { "metrics.cvssMetricV2.cvssData.baseScore": { $eq: 11 } },
        { "metrics.cvssMetricV3.cvssData.baseScore": { $eq: 11 } },
      ],
    });
  });

  test("should return 500 on server error", async () => {
    CVE.find.mockRejectedValue(new Error("Database error"));
    const res = await request(app).get("/api/cve/score/9");
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: "Database error" });
    expect(CVE.find).toHaveBeenCalledWith({
      $or: [
        { "metrics.cvssMetricV2.cvssData.baseScore": { $eq: 9 } },
        { "metrics.cvssMetricV3.cvssData.baseScore": { $eq: 9 } },
      ],
    });
  });
});
