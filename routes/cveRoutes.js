const express = require("express");
const router = express.Router();

// import controllers
const {
  getCVEController,
  getCVEControllerByID,
  getCVEControllerByYear,
  getCVEControllerByScore,
  getCVEControllerByRange,
} = require("../controllers/getCVEController");

router.get("/cve", getCVEController);
router.get("/cve/:id", getCVEControllerByID);
router.get("/cve/year/:year", getCVEControllerByYear);
router.get("/cve/score/:score", getCVEControllerByScore);
router.get("/cve/lastModified/:days", getCVEControllerByRange);

module.exports = router;
