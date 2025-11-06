// PM2 Ecosystem Configuration for Partner Demo Website
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: "partner-video",
      script: "./website-1-video/server.js",
      cwd: "/www/wwwroot/partner-demos",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 6000,
      },
      error_file: "./logs/partner-video-error.log",
      out_file: "./logs/partner-video-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "500M",
      watch: false,
    },
  ],
};
