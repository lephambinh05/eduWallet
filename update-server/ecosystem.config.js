module.exports = {
  apps: [
    {
      name: "mojistudio-update-server",
      script: "./server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3006,
      },
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_memory_restart: "500M",
      autorestart: true,
      watch: false,
    },
  ],
};
