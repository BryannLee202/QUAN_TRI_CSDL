module.exports = {
  apps: [
    {
      name: 'mushroomcloud-backend',
      script: './backend/dist/server.js',
      instances: 1, // Node.js + SQL Server connection pool tối ưu với 1 instance ổn định
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
    },
  ],
};
