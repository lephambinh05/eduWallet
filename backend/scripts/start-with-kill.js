const { spawn } = require("child_process");
const path = require("path");

// Load .env from backend folder so PORT is available to this script and its children.
// Using a small manual loader to avoid relying on module resolution edge-cases in this environment.
try {
  const envPath = path.join(__dirname, "..", ".env");
  let envRaw = require("fs").readFileSync(envPath, "utf8");
  // Strip UTF-8 BOM if present
  if (envRaw.charCodeAt(0) === 0xfeff) {
    envRaw = envRaw.slice(1);
  }
  console.log(`📄 Loaded .env from: ${envPath} (len=${envRaw.length})`);
  envRaw.split(/\r?\n/).forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) return;
    const key = trimmed.slice(0, eqIndex).trim();
    let val = trimmed.slice(eqIndex + 1).trim();
    // Remove surrounding quotes if present
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    console.log(`🔧 Parsed .env line ${idx + 1}: key='${key}'`);
    if (!(key in process.env)) {
      process.env[key] = val;
      console.log(`✅ Set process.env.${key}`);
    } else {
      console.log(`ℹ️ process.env.${key} already present, skipping`);
    }
  });
} catch (err) {
  // If .env can't be read, continue — child processes will try to load env themselves
  console.warn(
    "⚠️  Could not load backend .env file automatically:",
    err.message
  );
}

const PORT = process.env.PORT;
console.log(`🔍 Checking for processes on port ${PORT}...`);
console.log(`🔎 parent process MONGODB_URI=${process.env.MONGODB_URI}`);

// First, kill any existing processes on the port
const killProcess = spawn("node", [path.join(__dirname, "kill-port.js")], {
  stdio: "inherit",
  env: process.env,
});

killProcess.on("close", (code) => {
  if (code === 0) {
    console.log("✅ Port cleared, starting backend server...");

    // Start the actual backend server in this process so it inherits the env we just loaded.
    try {
      require(path.join(__dirname, "..", "app-with-api.js"));
      console.log("✅ Backend server loaded in-process");
    } catch (err) {
      console.error("❌ Failed to load backend server in-process:", err);
      process.exit(1);
    }

    // Handle process termination: exit the process and let app shutdown handlers run if any
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down backend server...");
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log("\n🛑 Shutting down backend server...");
      process.exit(0);
    });
  } else {
    console.error("❌ Failed to clear port");
    process.exit(1);
  }
});

killProcess.on("error", (error) => {
  console.error("❌ Error running kill script:", error);
  process.exit(1);
});
