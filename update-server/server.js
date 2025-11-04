/**
 * UPDATE SERVER API - mojistudio.vn
 *
 * API endpoint để cung cấp version info và file download cho auto-update
 * Port: 3006 (hoặc tùy chỉnh)
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3006;

// ==================== CONFIG ====================

const CONFIG = {
  // Đường dẫn files
  versionsDir: path.join(__dirname, "versions"),
  downloadsDir: path.join(__dirname, "downloads"),
  logsDir: path.join(__dirname, "logs"),

  // Projects được hỗ trợ
  supportedProjects: ["eduWallet", "SHOPCLONE6"],

  // Security
  requireAuth: false, // Bật/tắt authentication
  authToken: "your-secret-token-here",
};

// ==================== MIDDLEWARE ====================

app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const log = `[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}\n`;

  fs.appendFile(path.join(CONFIG.logsDir, "access.log"), log, (err) => {
    if (err) console.error("Log error:", err);
  });

  console.log(log.trim());
  next();
});

// Authentication middleware (optional)
function authMiddleware(req, res, next) {
  if (!CONFIG.requireAuth) {
    return next();
  }

  const token = req.headers.authorization?.replace("Bearer ", "");

  if (token !== CONFIG.authToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Lấy thông tin version của project
 */
function getVersionInfo(projectName) {
  const versionFile = path.join(CONFIG.versionsDir, `${projectName}.json`);

  if (!fs.existsSync(versionFile)) {
    return null;
  }

  try {
    const data = fs.readFileSync(versionFile, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading version file:", error);
    return null;
  }
}

/**
 * Log version check
 */
function logVersionCheck(projectName, clientIP, version) {
  const timestamp = new Date().toISOString();
  const logFile = path.join(CONFIG.logsDir, `${projectName}-checks.log`);
  const logData = `[${timestamp}] IP: ${clientIP} - Project: ${projectName} - Version: ${version}\n`;

  fs.appendFile(logFile, logData, (err) => {
    if (err) console.error("Log error:", err);
  });
}

// ==================== ROUTES ====================

/**
 * GET / - Home page
 */
app.get("/", (req, res) => {
  res.json({
    service: "mojistudio.vn Update Server",
    version: "1.0.0",
    endpoints: {
      versionCheck: "/api/version.php?project=<projectName>",
      projectInfo: "/project?name=<projectName>",
      download: "/downloads/<filename>",
    },
    supportedProjects: CONFIG.supportedProjects,
  });
});

/**
 * GET /api/version.php?project=eduWallet
 * Trả về version mới nhất (text/plain - giống PHP)
 */
app.get("/api/version.php", authMiddleware, (req, res) => {
  const projectName = req.query.project || req.query.version;

  if (!projectName) {
    return res.status(400).send("Missing project parameter");
  }

  if (!CONFIG.supportedProjects.includes(projectName)) {
    return res.status(404).send("Project not found");
  }

  const versionInfo = getVersionInfo(projectName);

  if (!versionInfo) {
    return res.status(404).send("Version info not found");
  }

  // Log request
  logVersionCheck(projectName, req.ip, versionInfo.version);

  // Trả về plain text version (giống PHP)
  res.type("text/plain");
  res.send(versionInfo.version);
});

/**
 * GET /project?name=eduWallet
 * Trả về full version info (JSON)
 */
app.get("/project", authMiddleware, (req, res) => {
  const projectName = req.query.name;

  if (!projectName) {
    return res.status(400).json({ error: "Missing project name" });
  }

  if (!CONFIG.supportedProjects.includes(projectName)) {
    return res.status(404).json({ error: "Project not found" });
  }

  const versionInfo = getVersionInfo(projectName);

  if (!versionInfo) {
    return res.status(404).json({ error: "Version info not found" });
  }

  // Log request
  logVersionCheck(projectName, req.ip, versionInfo.version);

  res.json(versionInfo);
});

/**
 * GET /downloads/:filename
 * Download file ZIP
 */
app.get("/downloads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(CONFIG.downloadsDir, filename);

  // Security: Chỉ cho download file .zip
  if (!filename.endsWith(".zip")) {
    return res.status(400).json({ error: "Invalid file type" });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  console.log(`📥 Download: ${filename} - IP: ${req.ip}`);

  // Stream file
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("Download error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Download failed" });
      }
    } else {
      // Log download
      const logFile = path.join(CONFIG.logsDir, "downloads.log");
      const logData = `[${new Date().toISOString()}] ${filename} - IP: ${
        req.ip
      }\n`;
      fs.appendFile(logFile, logData, () => {});
    }
  });
});

/**
 * POST /upload (Admin only)
 * Upload new version file
 */
app.post("/upload", authMiddleware, (req, res) => {
  // TODO: Implement file upload với multer
  res.json({ message: "Upload endpoint - TODO" });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ==================== ERROR HANDLING ====================

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ==================== START SERVER ====================

// Tạo folders nếu chưa có
[CONFIG.versionsDir, CONFIG.downloadsDir, CONFIG.logsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.listen(PORT, () => {
  console.log(`
========================================
🚀 MOJISTUDIO UPDATE SERVER
========================================
Port: ${PORT}
Versions: ${CONFIG.versionsDir}
Downloads: ${CONFIG.downloadsDir}
Logs: ${CONFIG.logsDir}

Endpoints:
  GET  /api/version.php?project=eduWallet
  GET  /project?name=eduWallet
  GET  /downloads/<filename>
  GET  /health

Supported Projects: ${CONFIG.supportedProjects.join(", ")}
========================================
  `);
});

module.exports = app;
