const axios = require("axios");
const CVE = require("../models/CVE");

const fetchCVEData = async () => {
  let startIndex = 0;
  const resultsPerPage = 2000; // Fetch in chunks of 2000 items

  try {
    while (true) {
      const response = await axios.get(
        `https://services.nvd.nist.gov/rest/json/cves/2.0?startIndex=${startIndex}&resultsPerPage=${resultsPerPage}`
      );

      const { vulnerabilities } = response.data;

      if (!vulnerabilities || vulnerabilities.length === 0) {
        console.log("All data fetched.");
        break;
      }

      // Extract and save each CVE
      for (const item of vulnerabilities) {
        const cve = item.cve;
        const cveData = {
          cveId: cve.id,
          sourceIdentifier: cve.sourceIdentifier,
          published: cve.published,
          lastModified: cve.lastModified,
          vulnStatus: cve.vulnStatus,
          descriptions: cve.descriptions[0].value,
          metrics: cve.metrics || {},
          configurations: cve.configurations || {},
        };

        // Insert into DB (handle duplicates with `upsert`)
        await CVE.updateOne({ cveId: cveData.cveId }, cveData, {
          upsert: true,
        });
      }

      console.log(
        `Fetched and saved ${startIndex + vulnerabilities.length} CVEs.`
      );
      startIndex += resultsPerPage;
    }
  } catch (error) {
    console.error("Error fetching CVE data:", error.message);
  }
};

module.exports = fetchCVEData;
