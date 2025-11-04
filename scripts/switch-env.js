const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const environment = args[0] || "production";

const rootDir = path.join(__dirname, "..");
const sourceEnvFile = path.join(rootDir, `.env.${environment}`);
const targetEnvFile = path.join(rootDir, ".env");

if (!fs.existsSync(sourceEnvFile)) {
  console.error(`❌ File .env.${environment} không tồn tại!`);
  console.log("\n📋 Available environments:");

  const envFiles = fs
    .readdirSync(rootDir)
    .filter((file) => file.startsWith(".env."))
    .map((file) => file.replace(".env.", ""));

  envFiles.forEach((env) => {
    console.log(`   - ${env}`);
  });

  process.exit(1);
}

// Backup current .env if exists
if (fs.existsSync(targetEnvFile)) {
  const backupFile = path.join(rootDir, ".env.backup");
  fs.copyFileSync(targetEnvFile, backupFile);
  console.log(`📦 Backed up current .env to .env.backup`);
}

// Copy environment file
fs.copyFileSync(sourceEnvFile, targetEnvFile);
console.log(`✅ Switched to ${environment} environment`);
console.log(`📄 Copied .env.${environment} → .env`);

// Show some key variables
const envContent = fs.readFileSync(targetEnvFile, "utf-8");
const lines = envContent
  .split("\n")
  .filter(
    (line) =>
      line.startsWith("REACT_APP_BACKEND_URL") || line.startsWith("NODE_ENV")
  )
  .map((line) => `   ${line}`);

if (lines.length > 0) {
  console.log("\n🔍 Key variables:");
  lines.forEach((line) => console.log(line));
}

console.log("\n💡 Next steps:");
console.log("   1. Run: npm run generate:htaccess");
console.log("   2. Run: npm start (development) or npm run build (production)");
