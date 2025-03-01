const request = require("supertest");
const express = require("express");
const CVE = require("../models/CVE");
const { getCVEControllerByYear } = require("../controllers/getCVEController");

const app = express();
app.use(express.json());
app.get("/cve/:year", getCVEControllerByYear);

jest.mock("../models/CVE");

describe("GET /cve/:year", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return paginated CVEs for a valid year", async () => {
    const mockCVE = {
      _id: "67614c53563e1cb2310aaf57",
      cveId: "CVE-1999-0095",
      published: "1988-09-30T22:30:00.000Z",
      descriptions:
        "The debug command in Sendmail is enabled, allowing attackers to execute commands as root.",
    };

    const mockPaginationData = [mockCVE];

    CVE.find
      .mockReturnValueOnce({
        skip: jest.fn().mockReturnValueOnce({
          limit: jest.fn().mockResolvedValueOnce(mockPaginationData),
        }),
      })
      .mockReturnValueOnce({
        countDocuments: jest.fn().mockResolvedValueOnce(3),
      });

    const response = await request(app).get("/cve/1988?page=1&limit=1");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("cves");
    expect(response.body.cves.length).toBe(1);
    expect(response.body.cves[0].cveId).toBe("CVE-1999-0095");
    expect(response.body.pagination.totalCount).toBe(3);
    expect(response.body.pagination.currentPage).toBe(1);
    expect(response.body.pagination.perPage).toBe(1);
  });

  test("should return 404 if no CVEs are found for the year", async () => {
    CVE.find.mockReturnValueOnce({
      skip: jest.fn().mockReturnValueOnce({
        limit: jest.fn().mockResolvedValueOnce([]),
      }),
    });

    const response = await request(app).get("/cve/3000?page=1&limit=1");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      "No such cve is available with year: 3000"
    );
  });

  test("should handle server errors gracefully", async () => {
    CVE.find.mockImplementation(() => {
      throw new Error("Database error");
    });

    const response = await request(app).get("/cve/1988?page=1&limit=1");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Database error");
  });
});
