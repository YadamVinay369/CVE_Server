const request = require("supertest");
const express = require("express");
const CVE = require("../models/CVE");
const { getCVEControllerByID } = require("../controllers/getCVEController");

const app = express();
app.use(express.json());
app.get("/cve/:id", getCVEControllerByID);

jest.mock("../models/CVE");

describe("GET /cve/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return CVE details for a valid ID", async () => {
    const mockCVE = {
      _id: "67614c53563e1cb2310aaf57",
      cveId: "CVE-1999-0095",
      published: "1988-09-30T22:30:00.000Z",
      descriptions:
        "The debug command in Sendmail is enabled, allowing attackers to execute commands as root.",
    };

    CVE.findOne.mockResolvedValue(mockCVE);

    const response = await request(app).get("/cve/CVE-1999-0095");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("cveId", "CVE-1999-0095");
    expect(response.body).toHaveProperty("descriptions");
  });

  test("should return 404 if CVE not found", async () => {
    CVE.findOne.mockResolvedValue(null);

    const response = await request(app).get("/cve/CVE-9999-0000");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("CVE not found");
  });

  test("should handle server errors gracefully", async () => {
    CVE.findOne.mockImplementation(() => {
      throw new Error("Database error");
    });

    const response = await request(app).get("/cve/CVE-1999-0095");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Database error");
  });
});
