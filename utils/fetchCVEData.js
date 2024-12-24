const axios = require("axios");
const CVE = require("../models/CVE");

const NVD_API_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0";
const RESULTS_PER_PAGE = 2000;
const MAX_RETRIES = 3;

const fetchCVEDataChunk = async (startIndex) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const response = await axios.get(
        `${NVD_API_URL}?startIndex=${startIndex}&resultsPerPage=${RESULTS_PER_PAGE}`
      );
      return response.data;
    } catch (error) {
      retries += 1;
      console.error(`Retry ${retries}/${MAX_RETRIES} failed:`, error.message);

      if (retries === MAX_RETRIES) {
        throw new Error("Max retries reached. Unable to fetch data.");
      }
    }
  }
};

const fetchCVEData = async () => {
  let startIndex = 0;

  try {
    while (true) {
      console.log(`Fetching CVE data starting from index: ${startIndex}`);

      const data = await fetchCVEDataChunk(startIndex);
      const { vulnerabilities } = data;

      if (!vulnerabilities || vulnerabilities.length === 0) {
        console.log("All CVE data fetched successfully.");
        break;
      }

      const bulkOps = vulnerabilities
        .map((item) => {
          const cve = item.cve;
          if (
            cve &&
            cve.metrics &&
            cve.configurations &&
            Object.keys(cve.metrics).length > 0 &&
            Object.keys(cve.configurations).length > 0
          ) {
            return {
              updateOne: {
                filter: { cveId: cve.id },
                update: {
                  cveId: cve.id,
                  sourceIdentifier: cve.sourceIdentifier,
                  published: cve.published,
                  lastModified: cve.lastModified,
                  vulnStatus: cve.vulnStatus,
                  descriptions: cve.descriptions[0]?.value || "",
                  metrics: cve.metrics || {},
                  configurations: cve.configurations || {},
                },
                upsert: true,
              },
            };
          }
          return null;
        })
        .filter((op) => op !== null);

      if (bulkOps.length > 0) {
        await CVE.bulkWrite(bulkOps);
        console.log(
          `Fetched and stored ${vulnerabilities.length} CVEs (up to index ${
            startIndex + RESULTS_PER_PAGE
          }).`
        );
        startIndex += RESULTS_PER_PAGE;
      } else {
        console.log("No new CVEs to store.");
      }
    }
  } catch (error) {
    console.error("Error during CVE data synchronization:", error.message);
  }
};

module.exports = fetchCVEData;
