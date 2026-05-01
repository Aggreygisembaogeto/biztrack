# 🚀 Production Deployment Guide

## Overview

This guide will help you deploy BizTrack to an external server with:
- User Application
- Admin Application  
- Backend API
- Production-ready configurations

## 📋 Prerequisites

- Domain name (e.g., biztrack.com)
- Server with Node.js installed
- SSL certificate (for HTTPS)
- Database (SQLite or PostgreSQL)

## 🌐 Recommended Domain Structure

```
https://app.biztrack.com      → User Application
https://admin.biztrack.com    → Admin Application
https://api.biztrack.com      → Backend API
```

Or with subpaths:
```
https://biztrack.com          → User Application
https://biztrack.com/admin    → Admin Application
https://biztrack.com/api      → Backend API
```

## 📁 Project Structure

```
biztrack/
├── frontend/          # User Application
├── admin-panel/       # Admin Application
├── backend/           # API Server
└── deployment/        # Deployment configs
```

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-jwt-key-change-this
DATABASE_URL=your-database-url
FRONTEND_URL=https://app.biztrack.com
ADMIN_URL=https://admin.biztrack.com

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://api.biztrack.com/api/auth/google/callback

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://api.biztrack.com/api/auth/github/callback

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=https://api.biztrack.com/api/auth/facebook/callback
```

#### User Frontend (.env.production)
```env
VITE_API_URL=https://api.biztrack.com
VITE_APP_NAME=BizTrack
VITE_APP_VERSION=1.0.0
```

#### Admin Frontend (.env.production)
```env
VITE_API_URL=https://api.biztrack.com
VITE_APP_NAME=BizTrack Admin
```

### Step 2: Build Applications

#### Build User Application
```bash
cd frontend
npm install
npm run build
# Output: frontend/dist/
```

#### Build Admin Application
```bash
cd admin-panel
npm install
npm run build
# Output: admin-panel/dist/
```

#### Prepare Backend
```bash
cd backend
npm install --production
# Backend runs directly with Node.js
```

### Step 3: Server Setup

#### Option A: Single Server Deployment

```
Server (e.g., DigitalOcean, AWS EC2)
├── /var/www/app.biztrack.com     → frontend/dist/
├── /var/www/admin.biztrack.com   → admin-panel/dist/
└── /var/www/api                  → backend/
```

#### Option B: Multiple Servers

```
Server 1: app.biztrack.com
└── frontend/dist/

Server 2: admin.biztrack.com
└── admin-panel/dist/

Server 3: api.biztrack.com
└── backend/
```

### Step 4: Nginx Configuration

#### For User App (app.biztrack.com)
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name app.biztrack.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name app.biztrack.com;

    ssl_certificate /etc/letsencrypt/live/app.biztrack.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.biztrack.com/privkey.pem;

    root /var/www/app.biztrack.com;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### For Admin App (admin.biztrack.com)
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name admin.biztrack.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.biztrack.com;

    ssl_certificate /etc/letsencrypt/live/admin.biztrack.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.biztrack.com/privkey.pem;

    root /var/www/admin.biztrack.com;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### For Backend API (api.biztrack.com)
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.biztrack.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.biztrack.com;

    ssl_certificate /etc/letsencrypt/live/api.biztrack.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.biztrack.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 5: Process Management (PM2)

#### Install PM2
```bash
npm install -g pm2
```

#### Start Backend with PM2
```bash
cd backend
pm2 start server-production.js --name biztrack-api
pm2 save
pm2 startup
```

#### PM2 Configuration (ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'biztrack-api',
    script: './server-production.js',
    cwd: '/var/www/api',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### Step 6: SSL Certificates (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d app.biztrack.com
sudo certbot --nginx -d admin.biztrack.com
sudo certbot --nginx -d api.biztrack.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Step 7: Database Setup

#### SQLite (Development/Small Scale)
```bash
# Database file location
/var/www/api/data/biztrack.db

# Ensure proper permissions
chmod 644 /var/www/api/data/biztrack.db
chown www-data:www-data /var/www/api/data/biztrack.db
```

#### PostgreSQL (Production/Large Scale)
```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE biztrack;
CREATE USER biztrack_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE biztrack TO biztrack_user;
\q

# Update backend .env
DATABASE_URL=postgresql://biztrack_user:your-password@localhost:5432/biztrack
```

### Step 8: Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

### Step 9: Deploy Files

#### Using SCP
```bash
# User App
scp -r frontend/dist/* user@server:/var/www/app.biztrack.com/

# Admin App
scp -r admin-panel/dist/* user@server:/var/www/admin.biztrack.com/

# Backend
scp -r backend/* user@server:/var/www/api/
```

#### Using Git
```bash
# On server
cd /var/www
git clone https://github.com/yourusername/biztrack.git
cd biztrack

# Build applications
cd frontend && npm install && npm run build
cd ../admin-panel && npm install && npm run build
cd ../backend && npm install --production
```

### Step 10: Start Services

```bash
# Start backend
cd /var/www/api
pm2 start ecosystem.config.js

# Restart Nginx
sudo systemctl restart nginx

# Check status
pm2 status
sudo systemctl status nginx
```

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS (SSL certificates)
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure security headers
- [ ] Use PM2 for process management
- [ ] Set up monitoring and logging

## 📊 Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs biztrack-api
```

### Nginx Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Application Logs
```bash
pm2 logs biztrack-api --lines 100
```

## 🔄 Updates and Maintenance

### Update User App
```bash
cd frontend
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/app.biztrack.com/
```

### Update Admin App
```bash
cd admin-panel
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/admin.biztrack.com/
```

### Update Backend
```bash
cd backend
git pull
npm install --production
pm2 restart biztrack-api
```

## 🆘 Troubleshooting

### Check if services are running
```bash
pm2 status
sudo systemctl status nginx
```

### Check logs
```bash
pm2 logs biztrack-api
tail -f /var/log/nginx/error.log
```

### Restart services
```bash
pm2 restart biztrack-api
sudo systemctl restart nginx
```

### Check ports
```bash
sudo netstat -tulpn | grep LISTEN
```

## 📝 Post-Deployment Checklist

- [ ] User app accessible at https://app.biztrack.com
- [ ] Admin app accessible at https://admin.biztrack.com
- [ ] API accessible at https://api.biztrack.com
- [ ] SSL certificates working
- [ ] User registration working
- [ ] User login working
- [ ] Admin login working
- [ ] Database connections working
- [ ] All API endpoints working
- [ ] PM2 auto-restart configured
- [ ] Backups configured
- [ ] Monitoring set up

## 🎯 Quick Deployment Commands

```bash
# 1. Build everything
cd frontend && npm run build
cd ../admin-panel && npm run build
cd ../backend && npm install --production

# 2. Deploy to server
scp -r frontend/dist/* user@server:/var/www/app/
scp -r admin-panel/dist/* user@server:/var/www/admin/
scp -r backend/* user@server:/var/www/api/

# 3. On server
pm2 restart biztrack-api
sudo systemctl reload nginx
```

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)

---

**Ready for production deployment!** 🚀
