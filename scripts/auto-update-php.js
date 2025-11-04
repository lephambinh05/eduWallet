/**
 * AUTO UPDATE SYSTEM - EduWallet (Converted from PHP)
 *
 * Tự động kiểm tra và cập nhật version mới từ server
 * Original: PHP cURL + ZipArchive
 * Converted: Node.js + axios + adm-zip
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const axios = require("axios");

// ==================== CONFIG ====================

const config = {
  version: "1.0.0", // Version hiện tại
  projectName: "eduWallet",

  // API endpoints
  versionCheckUrl: "https://mojistudio.vn/api/version.php?project=eduWallet",
  downloadUrl: "https://mojistudio.vn/downloads/eduWallet-latest.zip",
  installDbUrl: "https://mojistudio.vn/install.php",

  // Settings
  statusUpdate: true, // Bật/tắt auto-update
  timeout: 3000, // 3 seconds timeout

  // Paths
  updateDir: path.join(__dirname, ".."),
  logFile: path.join(__dirname, "../Update.txt"),

  // Security
  allowedIPs: ["127.0.0.1", "::1"], // Localhost không được chạy
  blockLocalhost: true,
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if IP is localhost
 */
function isLocalhost(ip) {
  return config.allowedIPs.includes(ip);
}

/**
 * Get client IP (for Express middleware)
 */
function getClientIP(req) {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress
  );
}

/**
 * Random string generator (giống random() trong PHP)
 */
function random(chars, length) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Get current time (giống gettime() trong PHP)
 */
function getTime() {
  return new Date().toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * curl_get_contents - Download file từ URL
 */
function curlGetContents(url, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;

    const options = {
      timeout: timeout,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
    };

    const req = client.get(url, options, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return curlGetContents(res.headers.location, timeout)
          .then(resolve)
          .catch(reject);
      }

      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve(data);
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.on("timeout", () => {
      req.abort();
      reject(new Error("Request timeout"));
    });
  });
}

/**
 * Download file binary (for ZIP)
 */
function downloadFile(url, savePath, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(savePath);

    const options = {
      timeout: timeout,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    };

    const req = client.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(savePath);
        return downloadFile(res.headers.location, savePath, timeout)
          .then(resolve)
          .catch(reject);
      }

      res.pipe(file);

      file.on("finish", () => {
        file.close();
        resolve(savePath);
      });
    });

    req.on("error", (error) => {
      fs.unlinkSync(savePath);
      reject(error);
    });

    req.on("timeout", () => {
      req.abort();
      fs.unlinkSync(savePath);
      reject(new Error("Download timeout"));
    });
  });
}

/**
 * Write log to file
 */
function writeLog(message) {
  try {
    const logMessage = `[UPDATE] ${message} vào lúc ${getTime()}\n`;
    fs.appendFileSync(config.logFile, logMessage);
    console.log(logMessage);
  } catch (error) {
    console.error("Lỗi ghi log:", error.message);
  }
}

/**
 * Extract ZIP file
 */
function extractZip(zipPath, extractPath) {
  return new Promise((resolve, reject) => {
    try {
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractPath, true); // true = overwrite
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Run install.php equivalent (install database)
 */
async function installDatabase() {
  try {
    const result = await curlGetContents(config.installDbUrl, 10000);

    if (result) {
      // Xóa file install.php sau khi chạy (nếu cần)
      const installFile = path.join(config.updateDir, "install.php");
      if (fs.existsSync(installFile)) {
        // fs.unlinkSync(installFile);
        console.log("✅ Database đã được cài đặt");
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("❌ Lỗi cài đặt database:", error.message);
    return false;
  }
}

// ==================== MAIN UPDATE PROCESS ====================

async function performAutoUpdate(clientIP = null) {
  try {
    console.log("\n========================================");
    console.log("🚀 EDUWALLET AUTO UPDATE SYSTEM");
    console.log("========================================\n");

    // 1. Check localhost
    if (config.blockLocalhost && clientIP && isLocalhost(clientIP)) {
      throw new Error("Localhost không thể sử dụng chức năng này");
    }

    // 2. Check status update
    if (!config.statusUpdate) {
      throw new Error("Chức năng cập nhật tự động đang được tắt");
    }

    // 3. Check version mới
    console.log("🔍 Đang kiểm tra phiên bản mới...");
    console.log(`   Version hiện tại: ${config.version}`);

    const serverVersion = await curlGetContents(
      config.versionCheckUrl,
      config.timeout
    );

    if (!serverVersion || serverVersion.trim() === "") {
      throw new Error("Không thể kết nối đến server");
    }

    console.log(`   Version trên server: ${serverVersion.trim()}`);

    // 4. So sánh version
    if (config.version === serverVersion.trim()) {
      console.log("✅ Không có phiên bản mới nhất");
      return {
        success: false,
        message: "Không có phiên bản mới nhất",
      };
    }

    console.log("\n🎉 Phát hiện phiên bản mới!");

    // 5. Tạo tên file random
    const filename = `update_${random("ABC123456789", 6)}.zip`;
    const filePath = path.join(config.updateDir, filename);

    console.log(`📥 Đang tải bản cập nhật...`);
    console.log(`   File: ${filename}`);

    // 6. Download ZIP từ server
    await downloadFile(config.downloadUrl, filePath, 60000); // 60s timeout
    console.log("✅ Tải xuống hoàn tất!");

    // 7. Giải nén
    console.log("📦 Đang giải nén và ghi đè hệ thống...");
    await extractZip(filePath, config.updateDir);
    console.log("✅ Giải nén thành công!");

    // 8. Xóa file ZIP
    console.log("🗑️  Đang xóa file ZIP...");
    fs.unlinkSync(filePath);
    console.log("✅ Đã xóa file ZIP");

    // 9. Chạy install database
    console.log("💾 Đang cài đặt database mới...");
    const dbInstalled = await installDatabase();

    if (dbInstalled) {
      console.log("✅ Database đã được cập nhật");
    }

    // 10. Ghi log
    writeLog("Phiên cập nhật phiên bản gần nhất");

    console.log("\n========================================");
    console.log("✅ CẬP NHẬT THÀNH CÔNG!");
    console.log(`   ${config.version} → ${serverVersion.trim()}`);
    console.log("========================================\n");

    return {
      success: true,
      message: "Cập nhật thành công!",
      oldVersion: config.version,
      newVersion: serverVersion.trim(),
    };
  } catch (error) {
    console.error("\n❌ CẬP NHẬT THẤT BẠI!");
    console.error(`   Lỗi: ${error.message}\n`);

    writeLog(`Cập nhật thất bại: ${error.message}`);

    return {
      success: false,
      message: error.message,
    };
  }
}

// ==================== EXPRESS MIDDLEWARE ====================

/**
 * Express middleware để chạy auto-update
 * Usage: app.get('/auto-update', autoUpdateMiddleware);
 */
function autoUpdateMiddleware(req, res) {
  const clientIP = getClientIP(req);

  console.log(`📍 Update request from: ${clientIP}`);

  performAutoUpdate(clientIP)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    });
}

// ==================== CLI ====================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
📚 EduWallet Auto Update - Hướng dẫn

Chạy update:
  node auto-update-php.js
  node auto-update-php.js --force  (bỏ qua check localhost)

Với Express:
  const { autoUpdateMiddleware } = require('./scripts/auto-update-php');
  app.get('/auto-update', autoUpdateMiddleware);

Config:
  - Version hiện tại: ${config.version}
  - Version check URL: ${config.versionCheckUrl}
  - Download URL: ${config.downloadUrl}
  - Status: ${config.statusUpdate ? "ENABLED" : "DISABLED"}
    `);
    process.exit(0);
  }

  // Force update (bỏ qua localhost check)
  if (args.includes("--force") || args.includes("-f")) {
    config.blockLocalhost = false;
  }

  // Run update
  performAutoUpdate()
    .then((result) => {
      if (result.success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

// ==================== EXPORTS ====================

module.exports = {
  performAutoUpdate,
  autoUpdateMiddleware,
  curlGetContents,
  downloadFile,
  config,
};
