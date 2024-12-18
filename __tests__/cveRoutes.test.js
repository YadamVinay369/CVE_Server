const mongoose = require("mongoose");
const CVE = require("../models/CVE");
const request = require("supertest");
const app = require("../server");

// Mock CVE data
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

beforeAll(async () => {
  // Disconnect from the default MongoDB connection (production)
  await mongoose.disconnect();

  // Connect to test database
  await mongoose.connect("mongodb://localhost:27017/test-db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Insert mock data into the test database
  await CVE.deleteMany({}); // Clear the collection before adding data
  await CVE.create(mockCVE);
});

afterAll(async () => {
  // Clean up the test database
  await CVE.deleteMany({});
  await mongoose.connection.close();
});

describe("GET /api/cve/:id", () => {
  it("should fetch a CVE by ID", async () => {
    // Test the API endpoint
    const res = await request(app).get(`/api/cve/${mockCVE.cveId}`);

    // Assertions - compare with processed data
    expect(res.statusCode).toBe(200);
    expect(res.body.cveId).toBe(mockCVE.cveId);
    expect(res.body.descriptions).toBe(mockCVE.descriptions);
    expect(res.body.vulnStatus).toBe(mockCVE.vulnStatus);
    expect(res.body.metrics.cvssMetricV2[0].baseSeverity).toBe(
      mockCVE.metrics.cvssMetricV2[0].baseSeverity
    );

    // Comparing dates, using the ISO string format
    expect(new Date(res.body.published).toISOString()).toBe(
      mockCVE.published.toISOString()
    );
    expect(new Date(res.body.lastModified).toISOString()).toBe(
      mockCVE.lastModified.toISOString()
    );
  });
});
