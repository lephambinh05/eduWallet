const { syncPartnerEnrollments } = require("./sync-partner-enrollments");

console.log(
  "[CRON] Starting partner enrollment sync cron job (every 1 second)"
);

// Run immediately on start
syncPartnerEnrollments().catch(console.error);

// Then run every 1 second
setInterval(() => {
  syncPartnerEnrollments().catch(console.error);
}, 1000);

console.log("[CRON] Cron job started. Press Ctrl+C to stop.");
