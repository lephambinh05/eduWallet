const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Import routes
const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  const students = global.students || {};
  const courses = global.courses || {};

  const allProgress = Object.values(students).flatMap((student) =>
    Object.values(student)
  );

  const health = {
    status: "UP",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: process.env.PARTNER_NAME || "Website 3 - Hybrid Learning",
    port: PORT,
    environment: process.env.NODE_ENV || "development",
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
    },
    stats: {
      totalStudents: Object.keys(students).length,
      totalCourses: Object.keys(courses).length,
      activeProgress: allProgress.filter((p) => p.status === "In Progress")
        .length,
      completedCourses: allProgress.filter((p) => p.status === "Completed")
        .length,
    },
    integrations: {
      apiUrl: process.env.API_URL,
      webhookEndpoint: process.env.WEBHOOK_ENDPOINT,
      apiKeyConfigured: !!process.env.PARTNER_API_KEY,
    },
  };

  res.json(health);
});

// API endpoint to get partner configuration
app.get("/config", (req, res) => {
  res.json({
    partnerId: process.env.PARTNER_ID,
    partnerName: process.env.PARTNER_NAME,
    jwtToken: process.env.PARTNER_JWT_TOKEN,
    apiKey: process.env.PARTNER_API_KEY,
    backendUrl: process.env.BACKEND_URL || "http://localhost:3001",
  });
});

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Partner Website 3 (Hybrid) running on http://localhost:${PORT}`);
  console.log(`Partner ID: ${process.env.PARTNER_ID}`);
});

module.exports = app;
