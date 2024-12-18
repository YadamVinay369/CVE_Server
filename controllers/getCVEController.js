const CVE = require("../models/CVE");

const getCVEController = async (req, res) => {
  try {
    // Get page and limit from query parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    // Fetch CVEs with pagination
    const cves = await CVE.find().skip(skip).limit(limit);

    // Get total count of CVEs for pagination information
    const totalCount = await CVE.countDocuments();

    if (!cves || cves.length === 0) {
      return res.status(404).json({ message: "No CVEs found" });
    }

    // Send paginated response
    res.json({
      cves,
      pagination: {
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        perPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCVEControllerByID = async (req, res) => {
  try {
    const cve = await CVE.findOne({ cveId: req.params.id });
    if (!cve) return res.status(404).json({ message: "CVE not found" });
    res.json(cve);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCVEControllerByYear = async (req, res) => {
  try {
    const year = req.params.year;
    const cves = await CVE.find({
      published: {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${Number(year) + 1}-01-01`),
      },
    });
    if (!cves || cves.length === 0)
      return res
        .status(404)
        .json({ message: `No such cve is available with year: ${year}` });
    res.json(cves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCVEControllerByScore = async (req, res) => {
  try {
    const score = parseFloat(req.params.score);
    const cves = await CVE.find({
      $or: [
        { "metrics.cvssMetricV2.cvssData.baseScore": { $eq: score } },
        { "metrics.cvssMetricV3.cvssData.baseScore": { $eq: score } },
      ],
    });
    if (!cves || cves.length === 0)
      return res
        .status(404)
        .json({ message: `No such cve is available with score: ${score}` });
    res.json(cves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCVEControllerByRange = async (req, res) => {
  try {
    const days = parseInt(req.params.days);
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const cves = await CVE.find({ lastModified: { $gte: dateLimit } });
    if (!cves || cves.length === 0)
      return res
        .status(404)
        .json({ message: "No such cve is available with given range" });
    res.status(200).json(cves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCVEController,
  getCVEControllerByID,
  getCVEControllerByYear,
  getCVEControllerByScore,
  getCVEControllerByRange,
};
