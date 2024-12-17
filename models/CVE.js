const mongoose = require("mongoose");

const CVESchema = new mongoose.Schema({
  cveId: { type: String, unique: true },
  sourceIdentifier: String,
  published: Date,
  lastModified: Date,
  vulnStatus: String,
  descriptions: String,
  metrics: Object,
  configurations: Object,
});

module.exports = mongoose.model("CVE", CVESchema);
