const request = require("supertest");
const express = require("express");
const CVE = require("../models/CVE");
const { getCVEControllerByRange } = require("../controllers/getCVEController");

const app = express();
app.use(express.json());
app.get("/cve/range/:days", getCVEControllerByRange);

jest.mock("../models/CVE");

describe("GET /cve/range/:days", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return paginated CVEs within a given date range", async () => {
    const mockCVE = {
      _id: "67614c53563e1cb2310aaf57",
      cveId: "CVE-1999-0095",
      lastModified: new Date(),
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

    const response = await request(app).get("/cve/range/30?page=1&limit=1");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("cves");
    expect(response.body.cves.length).toBe(1);
    expect(response.body.cves[0].cveId).toBe("CVE-1999-0095");
    expect(response.body.pagination.totalCount).toBe(3);
    expect(response.body.pagination.currentPage).toBe(1);
    expect(response.body.pagination.perPage).toBe(1);
  });

  test("should return 404 if no CVEs are found in the given range", async () => {
    CVE.find.mockReturnValueOnce({
      skip: jest.fn().mockReturnValueOnce({
        limit: jest.fn().mockResolvedValueOnce([]),
      }),
    });

    const response = await request(app).get("/cve/range/30?page=1&limit=1");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      "No such cve is available with given range"
    );
  });

  test("should handle server errors gracefully", async () => {
    CVE.find.mockImplementation(() => {
      throw new Error("Database error");
    });

    const response = await request(app).get("/cve/range/30?page=1&limit=1");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Database error");
  });
});
