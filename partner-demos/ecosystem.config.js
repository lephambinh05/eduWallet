// PM2 Ecosystem Configuration for All 3 Partner Demo Websites
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: "partner1-video",
      script: "./website-1-video/server.js",
      cwd: "/www/wwwroot/partner-demos",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 6000,
      },
      error_file: "./logs/partner1-error.log",
      out_file: "./logs/partner1-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "500M",
      watch: false,
    },
    {
      name: "partner2-quiz",
      script: "./website-2-quiz/server.js",
      cwd: "/www/wwwroot/partner-demos",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3003,
      },
      error_file: "./logs/partner2-error.log",
      out_file: "./logs/partner2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "500M",
      watch: false,
    },
    {
      name: "partner3-hybrid",
      script: "./website-3-hybrid/server.js",
      cwd: "/www/wwwroot/partner-demos",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3004,
      },
      error_file: "./logs/partner3-error.log",
      out_file: "./logs/partner3-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "500M",
      watch: false,
    },
  ],
};
