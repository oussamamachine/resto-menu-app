module.exports = {
  apps: [
    {
      name: 'qr-menu-server',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
}
