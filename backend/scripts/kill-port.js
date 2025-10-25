const { exec } = require("child_process");
const os = require("os");

// Use PORT from environment only
const PORT = process.env.PORT;

function killPort(port) {
  return new Promise((resolve, reject) => {
    const platform = os.platform();
    let command;

    if (platform === "win32") {
      // Windows command
      command = `netstat -ano | findstr :${port}`;
    } else {
      // Unix/Linux/Mac command
      command = `lsof -ti:${port}`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        // Port is not in use
        console.log(`✅ Port ${port} is available`);
        resolve();
        return;
      }

      if (platform === "win32") {
        // Parse Windows output to get PID
        const lines = stdout.trim().split("\n");
        const pids = new Set();

        lines.forEach((line) => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            const pid = parts[parts.length - 1];
            if (pid && !isNaN(pid)) {
              pids.add(pid);
            }
          }
        });

        if (pids.size === 0) {
          console.log(`✅ Port ${port} is available`);
          resolve();
          return;
        }

        // Kill processes on Windows
        const killPromises = Array.from(pids).map((pid) => {
          return new Promise((killResolve, killReject) => {
            exec(`taskkill /F /PID ${pid}`, (killError) => {
              if (killError) {
                console.log(
                  `⚠️  Could not kill process ${pid}: ${killError.message}`
                );
              } else {
                console.log(`🔪 Killed process ${pid} on port ${port}`);
              }
              killResolve();
            });
          });
        });

        Promise.all(killPromises).then(() => {
          console.log(`✅ Cleared port ${port}`);
          resolve();
        });
      } else {
        // Unix/Linux/Mac - kill processes
        const pids = stdout
          .trim()
          .split("\n")
          .filter((pid) => pid && !isNaN(pid));

        if (pids.length === 0) {
          console.log(`✅ Port ${port} is available`);
          resolve();
          return;
        }

        const killPromises = pids.map((pid) => {
          return new Promise((killResolve, killReject) => {
            exec(`kill -9 ${pid}`, (killError) => {
              if (killError) {
                console.log(
                  `⚠️  Could not kill process ${pid}: ${killError.message}`
                );
              } else {
                console.log(`🔪 Killed process ${pid} on port ${port}`);
              }
              killResolve();
            });
          });
        });

        Promise.all(killPromises).then(() => {
          console.log(`✅ Cleared port ${port}`);
          resolve();
        });
      }
    });
  });
}

// Run the kill function
killPort(PORT)
  .then(() => {
    console.log(`🚀 Starting server on port ${PORT}...`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error killing port:", error);
    process.exit(1);
  });
