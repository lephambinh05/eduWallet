/**
 * AUTO UPDATE SYSTEM - EduWallet
 *
 * Kiểm tra version mới từ server và tự động update
 * Check version từ: https://mojistudio.vn/project?name=eduWallet
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const AdmZip = require("adm-zip");

// ==================== CẤU HÌNH ====================

const CONFIG = {
  // Server update
  updateServer: "https://mojistudio.vn",
  projectName: "eduWallet",

  // Đường dẫn local
  versionFile: path.join(__dirname, "../version.json"),
  downloadDir: path.join(__dirname, "../downloads"),
  backupDir: path.join(__dirname, "../backups"),

  // Files không được ghi đè (bảo vệ)
  protectedFiles: [
    ".env",
    ".env.production",
    "backend/.env",
    "backend/.env.production",
    "partner-demos/website-1-video/.env",
    "partner-demos/website-2-quiz/.env",
    "partner-demos/website-3-hybrid/.env",
    "version.json",
    "package-lock.json",
    "node_modules/**",
    "logs/**",
    "uploads/**",
    "database.sqlite",
    "ssl/**",
    ".git/**",
  ],

  // Kiểm tra mỗi X giờ
  checkInterval: 6 * 60 * 60 * 1000, // 6 giờ

  // Tự động restart sau update
  autoRestart: true,
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Đọc version hiện tại
 */
function getCurrentVersion() {
  try {
    const data = fs.readFileSync(CONFIG.versionFile, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Không đọc được version.json:", error.message);
    return { version: "0.0.0" };
  }
}

/**
 * So sánh 2 version (semver)
 * @returns {number} 1 nếu v1 > v2, -1 nếu v1 < v2, 0 nếu bằng
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    if (parts1[i] > parts2[i]) return 1;
    if (parts1[i] < parts2[i]) return -1;
  }
  return 0;
}

/**
 * Kiểm tra version mới từ server
 */
function checkForUpdates() {
  return new Promise((resolve, reject) => {
    const url = `${CONFIG.updateServer}/project?name=${CONFIG.projectName}`;

    console.log("🔍 Đang kiểm tra version mới từ:", url);

    const client = url.startsWith("https") ? https : http;

    client
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const serverInfo = JSON.parse(data);
            resolve(serverInfo);
          } catch (error) {
            reject(new Error("Invalid JSON response"));
          }
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

/**
 * Download file ZIP từ server
 */
function downloadUpdate(downloadUrl, savePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(savePath);
    const client = downloadUrl.startsWith("https") ? https : http;

    console.log("⬇️  Đang tải:", downloadUrl);

    client
      .get(downloadUrl, (res) => {
        const totalSize = parseInt(res.headers["content-length"], 10);
        let downloaded = 0;

        res.on("data", (chunk) => {
          downloaded += chunk.length;
          const percent = ((downloaded / totalSize) * 100).toFixed(2);
          process.stdout.write(
            `\r   Tiến độ: ${percent}% (${(downloaded / 1024 / 1024).toFixed(
              2
            )} MB)`
          );
        });

        res.pipe(file);

        file.on("finish", () => {
          file.close();
          console.log("\n✅ Tải xuống hoàn tất!");
          resolve(savePath);
        });
      })
      .on("error", (error) => {
        fs.unlink(savePath, () => {});
        reject(error);
      });
  });
}

/**
 * Backup files hiện tại
 */
function backupCurrentVersion(currentVersion) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFolder = path.join(
    CONFIG.backupDir,
    `backup-v${currentVersion.version}-${timestamp}`
  );

  console.log("💾 Đang backup version hiện tại...");

  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }

  // Copy toàn bộ folder (trừ node_modules, downloads, backups)
  const excludeDirs = ["node_modules", "downloads", "backups", ".git", "logs"];
  const rootDir = path.join(__dirname, "..");

  exec(
    `xcopy "${rootDir}" "${backupFolder}" /E /I /H /Y /EXCLUDE:node_modules`,
    (error) => {
      if (error) {
        console.error("⚠️  Backup có lỗi:", error.message);
      } else {
        console.log("✅ Backup thành công:", backupFolder);
      }
    }
  );

  return backupFolder;
}

/**
 * Giải nén và update files
 */
function extractAndUpdate(zipPath) {
  return new Promise((resolve, reject) => {
    try {
      console.log("📦 Đang giải nén update...");

      const zip = new AdmZip(zipPath);
      const zipEntries = zip.getEntries();

      const rootDir = path.join(__dirname, "..");
      let updatedCount = 0;
      let skippedCount = 0;

      zipEntries.forEach((entry) => {
        const entryPath = entry.entryName;

        // Kiểm tra protected files
        const isProtected = CONFIG.protectedFiles.some((pattern) => {
          if (pattern.includes("**")) {
            const regex = new RegExp(pattern.replace("**", ".*"));
            return regex.test(entryPath);
          }
          return entryPath === pattern || entryPath.startsWith(pattern);
        });

        if (isProtected) {
          console.log(`⏭️  Bỏ qua (protected): ${entryPath}`);
          skippedCount++;
          return;
        }

        // Extract file
        const targetPath = path.join(rootDir, entryPath);

        if (entry.isDirectory) {
          if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
          }
        } else {
          const targetDir = path.dirname(targetPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          fs.writeFileSync(targetPath, entry.getData());
          updatedCount++;
          console.log(`✅ Updated: ${entryPath}`);
        }
      });

      console.log(`\n📊 Tổng kết:`);
      console.log(`   - Files đã update: ${updatedCount}`);
      console.log(`   - Files bỏ qua (protected): ${skippedCount}`);

      resolve({ updatedCount, skippedCount });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Restart PM2 processes
 */
function restartServices() {
  return new Promise((resolve) => {
    console.log("🔄 Đang restart services...");

    exec("pm2 restart all", (error, stdout, stderr) => {
      if (error) {
        console.error("⚠️  Restart có lỗi:", error.message);
      } else {
        console.log("✅ Restart thành công!");
      }
      resolve();
    });
  });
}

// ==================== MAIN UPDATE PROCESS ====================

async function performUpdate() {
  try {
    console.log("\n========================================");
    console.log("🚀 EDUWALLET AUTO UPDATE SYSTEM");
    console.log("========================================\n");

    // 1. Đọc version hiện tại
    const currentVersion = getCurrentVersion();
    console.log(`📍 Version hiện tại: ${currentVersion.version}`);

    // 2. Kiểm tra version mới
    const serverInfo = await checkForUpdates();
    console.log(`📍 Version trên server: ${serverInfo.version}`);

    // 3. So sánh version
    const comparison = compareVersions(
      serverInfo.version,
      currentVersion.version
    );

    if (comparison <= 0) {
      console.log("✅ Hệ thống đã là version mới nhất!");
      return;
    }

    console.log(`\n🎉 Phát hiện version mới: ${serverInfo.version}`);
    console.log(`📝 Ghi chú: ${serverInfo.description || "Không có"}`);

    // 4. Tạo folder downloads nếu chưa có
    if (!fs.existsSync(CONFIG.downloadDir)) {
      fs.mkdirSync(CONFIG.downloadDir, { recursive: true });
    }

    // 5. Download file ZIP
    const zipFileName = `eduWallet-v${serverInfo.version}.zip`;
    const zipPath = path.join(CONFIG.downloadDir, zipFileName);
    const downloadUrl = `${CONFIG.updateServer}${serverInfo.downloadUrl}`;

    await downloadUpdate(downloadUrl, zipPath);

    // 6. Backup version hiện tại
    backupCurrentVersion(currentVersion);

    // 7. Giải nén và update
    await extractAndUpdate(zipPath);

    // 8. Cập nhật version.json
    fs.writeFileSync(
      CONFIG.versionFile,
      JSON.stringify(
        {
          version: serverInfo.version,
          name: CONFIG.projectName,
          build: new Date().toISOString().split("T")[0].replace(/-/g, ""),
          description: serverInfo.description,
          updatedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );

    console.log("✅ Cập nhật version.json thành công!");

    // 9. Restart services (nếu enabled)
    if (CONFIG.autoRestart) {
      await restartServices();
    }

    // 10. Xóa file ZIP (tùy chọn)
    fs.unlinkSync(zipPath);
    console.log("🗑️  Đã xóa file ZIP tạm");

    console.log("\n========================================");
    console.log("✅ UPDATE HOÀN THÀNH!");
    console.log(`   ${currentVersion.version} → ${serverInfo.version}`);
    console.log("========================================\n");
  } catch (error) {
    console.error("\n❌ LỖI KHI UPDATE:", error.message);
    console.log("💡 Hệ thống vẫn chạy version cũ");
  }
}

// ==================== AUTO CHECK INTERVAL ====================

function startAutoCheck() {
  console.log(
    `🕐 Bật auto-check mỗi ${CONFIG.checkInterval / 1000 / 60 / 60} giờ`
  );

  // Check ngay lần đầu
  performUpdate();

  // Check định kỳ
  setInterval(() => {
    performUpdate();
  }, CONFIG.checkInterval);
}

// ==================== CLI ====================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
📚 EduWallet Auto Update - Hướng dẫn sử dụng

Chạy một lần:
  node auto-update.js

Chạy background (kiểm tra định kỳ):
  node auto-update.js --daemon

Với PM2:
  pm2 start auto-update.js --name "eduwallet-updater"
  pm2 save
  pm2 startup

Cấu hình:
  - File: scripts/auto-update.js
  - Version: version.json
  - Protected files: CONFIG.protectedFiles
    `);
    process.exit(0);
  }

  if (args.includes("--daemon") || args.includes("-d")) {
    startAutoCheck();
  } else {
    performUpdate().then(() => process.exit(0));
  }
}

module.exports = { performUpdate, checkForUpdates, getCurrentVersion };
