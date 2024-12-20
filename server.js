const dotenv = require("dotenv");
dotenv.config();
const cron = require("node-cron");

const express = require("express");
const connectDB = require("./config/db");
const fetchCVEData = require("./utils/fetchCVEData");
const cveRoutes = require("./routes/cveRoutes");
const cors = require("cors");

connectDB();
const app = express();
app.use(cors());

// Schedule the synchronization task
cron.schedule("0 2 * * *", async () => {
  console.log("Starting CVE synchronization at 2:00 PM...");
  try {
    await fetchCVEData();
    console.log("CVE synchronization completed successfully.");
  } catch (error) {
    console.error("CVE synchronization failed:", error.message);
  }
});

// Middleware to parse JSON request bodies
app.use(express.json());

// Use the CVE routes
app.use("/api", cveRoutes); // Prefix "/api" for all CVE-related routes

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);
});

module.exports = app;
