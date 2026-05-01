module.exports = {
  apps: [{
    name: 'biztrack-api',
    script: './server-production.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M',
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'data'],
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
