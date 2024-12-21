const CVE = require("../models/CVE");

const getCVEController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.year) {
      filter.published = {
        $gte: new Date(`${req.query.year}-01-01`),
        $lt: new Date(`${parseInt(req.query.year) + 1}-01-01`),
      };
    }

    if (req.query.score) {
      const score = parseFloat(req.query.score);
      filter.$or = [
        { "metrics.cvssMetricV2.cvssData.baseScore": score },
        { "metrics.cvssMetricV3.cvssData.baseScore": score },
      ];
    }

    if (req.query.days) {
      const days = parseInt(req.query.days);
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);
      filter.lastModified = { $gte: dateLimit };
    }

    const cves = await CVE.find(filter).skip(skip).limit(limit);
    const totalCount = await CVE.countDocuments(filter);

    if (!cves || cves.length === 0) {
      return res
        .status(404)
        .json({ message: "No CVEs found for the given filters" });
    }

    res.status(200).json({
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
    res.status(200).json(cve);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCVEControllerByYear = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const year = req.params.year;
    const cves = await CVE.find({
      published: {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${Number(year) + 1}-01-01`),
      },
    })
      .skip(skip)
      .limit(limit);

    if (!cves || cves.length === 0)
      return res
        .status(404)
        .json({ message: `No such cve is available with year: ${year}` });
    const totalCount = await CVE.find({
      published: {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${Number(year) + 1}-01-01`),
      },
    }).countDocuments();

    res.status(200).json({
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

const getCVEControllerByScore = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const score = parseFloat(req.params.score);
    const cves = await CVE.find({
      $or: [
        { "metrics.cvssMetricV2.cvssData.baseScore": { $eq: score } },
        { "metrics.cvssMetricV3.cvssData.baseScore": { $eq: score } },
      ],
    })
      .skip(skip)
      .limit(limit);
    if (!cves || cves.length === 0)
      return res
        .status(404)
        .json({ message: `No such cve is available with score: ${score}` });

    const totalCount = await CVE.find({
      $or: [
        { "metrics.cvssMetricV2.cvssData.baseScore": { $eq: score } },
        { "metrics.cvssMetricV3.cvssData.baseScore": { $eq: score } },
      ],
    }).countDocuments();

    res.status(200).json({
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

const getCVEControllerByRange = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const days = parseInt(req.params.days);
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const cves = await CVE.find({ lastModified: { $gte: dateLimit } })
      .skip(skip)
      .limit(limit);
    if (!cves || cves.length === 0)
      return res
        .status(404)
        .json({ message: "No such cve is available with given range" });
    const totalCount = await CVE.find({
      lastModified: { $gte: dateLimit },
    }).countDocuments();
    res.status(200).json({
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

module.exports = {
  getCVEController,
  getCVEControllerByID,
  getCVEControllerByYear,
  getCVEControllerByScore,
  getCVEControllerByRange,
};
