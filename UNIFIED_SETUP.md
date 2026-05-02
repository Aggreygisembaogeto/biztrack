# BizTrack Unified Setup Guide

## Overview

BizTrack is now a **unified application** where the backend serves the frontend. This makes deployment much simpler - you only need to deploy one application instead of two separate ones.

## Architecture

```
BizTrack Unified
├── server-unified.js          # Main server (serves API + frontend)
├── backend/                   # Backend code (API routes, controllers, etc.)
│   ├── routes/
│   ├── controllers/
│   ├── config/
│   └── data/                  # SQLite database
├── frontend/                  # React frontend source
│   ├── src/
│   └── dist/                  # Built frontend (served by backend)
└── package.json               # Unified dependencies
```

**How it works:**
1. Frontend is built into static files (`frontend/dist/`)
2. Backend serves these static files
3. API routes are available at `/api/*`
4. All other routes serve the React app (SPA routing)

## Local Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Step 1: Install Dependencies

```bash
# Install root dependencies (backend)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

Or use the shortcut:
```bash
npm run install-all
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
# Minimum required: JWT_SECRET
```

**Important**: Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Build Frontend

```bash
npm run build
```

This builds the React app into `frontend/dist/`

### Step 4: Start the Server

```bash
npm start
```

The unified server will start on port 5001 (or PORT from .env):
- **Frontend**: http://localhost:5001
- **API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/health

### Development Mode

For active development, you have two options:

**Option 1: Unified Development (Recommended)**
```bash
# Terminal 1: Start backend with auto-reload
npm run dev

# Terminal 2: Start frontend dev server with hot reload
npm run dev:frontend
```
- Frontend: http://localhost:3000 (with hot reload)
- Backend: http://localhost:5001 (with auto-reload)

**Option 2: Production-like Development**
```bash
# Build frontend and start unified server
npm run build
npm run dev
```
- Everything on: http://localhost:5001

## Production Deployment

### Option 1: Deploy to Vercel (Recommended for Unified)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Create vercel.json**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server-unified.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "server-unified.js"
       },
       {
         "src": "/(.*)",
         "dest": "server-unified.js"
       }
     ]
   }
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Add all variables from `.env.example`
   - Generate strong JWT_SECRET

### Option 2: Deploy to Railway.app (Easiest)

1. **Create account** at https://railway.app

2. **Create new project** → Deploy from GitHub

3. **Connect your repository**

4. **Set environment variables** in Railway dashboard:
   ```
   PORT=5001
   NODE_ENV=production
   JWT_SECRET=<your-strong-secret>
   DATABASE_PATH=./backend/data/biztrack.db
   ```

5. **Railway will automatically**:
   - Install dependencies
   - Run `npm run build` (builds frontend)
   - Run `npm start` (starts server)

6. **Your app is live!** Railway provides a URL like:
   `https://biztrack-production.up.railway.app`

### Option 3: Deploy to Render.com

1. **Create account** at https://render.com

2. **New Web Service** → Connect repository

3. **Configure**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

4. **Add environment variables** (same as Railway)

5. **Deploy** - Render will build and start your app

### Option 4: Traditional Server (VPS/EC2)

1. **SSH into your server**

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone repository**
   ```bash
   git clone https://github.com/Aggreygisembaogeto/biztrack.git
   cd biztrack
   ```

4. **Install dependencies and build**
   ```bash
   npm install
   npm run build
   ```

5. **Configure environment**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your values
   ```

6. **Install PM2 (process manager)**
   ```bash
   sudo npm install -g pm2
   ```

7. **Start application**
   ```bash
   pm2 start server-unified.js --name biztrack
   pm2 save
   pm2 startup  # Follow instructions to enable auto-start
   ```

8. **Configure Nginx (reverse proxy)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:5001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

9. **Enable HTTPS with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `NODE_ENV` | Environment | `production` |
| `JWT_SECRET` | JWT signing key | `<32+ char random string>` |
| `DATABASE_PATH` | SQLite database path | `./backend/data/biztrack.db` |

### Optional Variables

| Variable | Description | Required For |
|----------|-------------|--------------|
| `FRONTEND_URL` | CORS origin | Production CORS |
| `GOOGLE_CLIENT_ID` | Google OAuth | Social login |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Social login |
| `FACEBOOK_APP_ID` | Facebook OAuth | Social login |
| `FACEBOOK_APP_SECRET` | Facebook OAuth | Social login |
| `MPESA_CONSUMER_KEY` | M-Pesa API | M-Pesa payments |
| `MPESA_CONSUMER_SECRET` | M-Pesa API | M-Pesa payments |

## Database Setup

The SQLite database is automatically created on first run. To create an admin user:

```bash
cd backend
node create-admin.js
```

Follow the prompts to create an admin account.

## Testing the Deployment

### Health Check
```bash
curl https://yourdomain.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "BizTrack Unified Server is running",
  "timestamp": "2026-05-02T..."
}
```

### Test Login
```bash
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

### Test Frontend
Open browser: `https://yourdomain.com`

## Troubleshooting

### Issue: "Cannot GET /"
**Solution**: Make sure frontend is built
```bash
npm run build
```

### Issue: "API routes not working"
**Solution**: Check that API routes are defined before static file serving in `server-unified.js`

### Issue: "Database not found"
**Solution**: Check DATABASE_PATH in .env and ensure directory exists
```bash
mkdir -p backend/data
```

### Issue: "CORS errors"
**Solution**: Set FRONTEND_URL in .env to your domain
```bash
FRONTEND_URL=https://yourdomain.com
```

### Issue: "Port already in use"
**Solution**: Change PORT in .env or kill process using the port
```bash
# Find process
lsof -i :5001

# Kill process
kill -9 <PID>
```

## Monitoring

### View Logs (PM2)
```bash
pm2 logs biztrack
```

### View Status
```bash
pm2 status
```

### Restart Application
```bash
pm2 restart biztrack
```

### Stop Application
```bash
pm2 stop biztrack
```

## Updating the Application

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Install new dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Rebuild frontend**
   ```bash
   npm run build
   ```

4. **Restart server**
   ```bash
   pm2 restart biztrack
   ```

## Security Checklist

Before going live:
- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (allow only 80, 443)
- [ ] Set up database backups
- [ ] Review CORS settings
- [ ] Change default admin password
- [ ] Set up monitoring/alerts
- [ ] Test all authentication flows
- [ ] Review error handling

## Performance Optimization

### Enable Compression
Add to `server-unified.js`:
```javascript
const compression = require('compression');
app.use(compression());
```

### Enable Caching
Add cache headers for static files:
```javascript
app.use(express.static(path.join(__dirname, 'frontend', 'dist'), {
  maxAge: '1d',
  etag: true
}));
```

### Database Optimization
For production, consider PostgreSQL instead of SQLite for better performance.

## Support

- **Documentation**: See README.md and SECURITY.md
- **Issues**: https://github.com/Aggreygisembaogeto/biztrack/issues
- **Security**: See SECURITY.md for vulnerability reporting

---

**Version**: 3.0.0  
**Last Updated**: May 2, 2026  
**Status**: Production Ready (Unified Mode)
