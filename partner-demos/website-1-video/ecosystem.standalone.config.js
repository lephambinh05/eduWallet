module.exports = {
  apps: [
    {
      name: "partner1-video",
      script: "server.js",
      cwd: "/www/wwwroot/partner1.mojistudio.vn",
      instances: 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 6001,
      },
      env_file: ".env.standalone",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      max_memory_restart: "500M",
      watch: false,
      ignore_watch: ["node_modules", "logs", "public"],
    },
  ],
};
