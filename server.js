const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const connectDB = require("./config/db");
const fetchCVEData = require("./utils/fetchCVEData");
const cveRoutes = require("./routes/cveRoutes");
const cors = require("cors");

connectDB();
const app = express();
app.use(cors());

//Uncomment only if we want to fetch data
//fetchCVEData();

// Middleware to parse JSON request bodies
app.use(express.json());

// Use the CVE routes
app.use("/api", cveRoutes); // Prefix "/api" for all CVE-related routes

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);
});

module.exports = app;
