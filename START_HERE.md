# 🚀 BizTrack - Quick Start Guide

**Ready to deploy to production?** Follow these simple steps.

---

## 📋 What You Need

- Domain name (e.g., `yourdomain.com`)
- Server/VPS (DigitalOcean, AWS, Linode, etc.)
- Node.js installed on server
- Basic terminal/SSH knowledge

---

## ⚡ Quick Deployment (5 Steps)

### Step 1: Update Environment Variables

**User App** - `frontend/.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com
```

**Admin App** - `admin-panel/.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com
```

**Backend** - Create `backend/.env` on server:
```env
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-key-change-this-64-characters-minimum
FRONTEND_URL=https://app.yourdomain.com
ADMIN_URL=https://admin.yourdomain.com
```

### Step 2: Build Applications

```bash
bash deploy.sh
```

This creates `./deployment/` folder with all built files.

### Step 3: Upload to Server

```bash
# Upload user app
rsync -avz deployment/user-app/ user@server:/var/www/app/

# Upload admin app
rsync -avz deployment/admin-app/ user@server:/var/www/admin/

# Upload backend
rsync -avz deployment/backend/ user@server:/var/www/api/
```

### Step 4: Start Backend (On Server)

```bash
# Install dependencies
cd /var/www/api
npm install --production

# Install PM2
npm install -g pm2

# Start backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the command it outputs

# Create admin user
node create-admin.js
```

### Step 5: Configure Nginx & SSL

See `PRODUCTION_DEPLOYMENT_GUIDE.md` for detailed Nginx configuration and SSL setup.

---

## 🌐 Production URLs

- User App: `https://app.yourdomain.com`
- Admin App: `https://admin.yourdomain.com`
- Backend API: `https://api.yourdomain.com`

---

## 🧪 Test Your Deployment

```bash
# Test API
curl https://api.yourdomain.com/api/health

# Open in browser
https://app.yourdomain.com
https://admin.yourdomain.com
```

---

## 📚 Need More Details?

See `PRODUCTION_DEPLOYMENT_GUIDE.md` for:
- Complete Nginx configuration
- SSL certificate setup
- Security hardening
- Monitoring setup
- Troubleshooting

---

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret (64+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (ports 80, 443, 22)
- [ ] Set up automated backups

---

## 🆘 Common Issues

**"Failed to fetch"** → Backend not running: `pm2 restart biztrack-api`

**CORS errors** → Check `FRONTEND_URL` and `ADMIN_URL` in backend `.env`

**401 Unauthorized** → Token expired, logout and login again

**More help**: See troubleshooting section in `PRODUCTION_DEPLOYMENT_GUIDE.md`

---

**Last Updated**: May 1, 2026  
**Version**: 3.0.0
