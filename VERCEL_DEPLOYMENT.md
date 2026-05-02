# 🚀 Deploy BizTrack to Vercel - Complete Guide

## Important: Database Consideration

⚠️ **Vercel uses serverless functions** - SQLite database will reset on each deployment.

### Solutions:

**Option 1: Use External Database (Recommended)**
- Use Vercel Postgres (built-in, easy)
- Use Supabase (free tier, PostgreSQL)
- Use PlanetScale (free tier, MySQL)

**Option 2: Hybrid Deployment**
- Frontend on Vercel (fast, free)
- Backend on Railway (persistent SQLite)

---

## Quick Deploy: Frontend on Vercel + Backend on Railway

This is the **easiest and best approach** for your app.

### Step 1: Deploy Backend to Railway (5 minutes)

**1. Go to Railway**
- Visit: https://railway.app
- Login with GitHub

**2. Create New Project**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose: `Aggreygisembaogeto/biztrack`

**3. Configure Backend**
- Railway auto-detects Node.js
- Click on the service
- Go to "Settings"
- Set **Root Directory**: `backend`
- Set **Start Command**: `npm start`

**4. Add Environment Variables**
Click "Variables" tab and add:

```
NODE_ENV=production
PORT=5001
JWT_SECRET=<generate-strong-secret>
DATABASE_PATH=./data/biztrack.db
FRONTEND_URL=https://your-app.vercel.app
```

**Generate JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**5. Deploy Backend**
- Click "Deploy"
- Wait 2-3 minutes
- Copy your backend URL: `https://biztrack-backend-xxx.railway.app`

---

### Step 2: Deploy Frontend to Vercel (3 minutes)

**Method A: Using Vercel Dashboard (Easiest)**

**1. Go to Vercel**
- Visit: https://vercel.com
- Login with GitHub

**2. Import Project**
- Click "Add New..." → "Project"
- Select your repository: `Aggreygisembaogeto/biztrack`
- Click "Import"

**3. Configure Project**
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**4. Add Environment Variable**
- Click "Environment Variables"
- Add:
  - **Name**: `VITE_API_URL`
  - **Value**: `https://your-railway-backend-url.railway.app`
  - (Use the URL from Step 1)

**5. Deploy**
- Click "Deploy"
- Wait 2-3 minutes
- Your frontend will be live!
- Copy your Vercel URL: `https://biztrack-xxx.vercel.app`

**6. Update Backend**
- Go back to Railway
- Update `FRONTEND_URL` variable with your Vercel URL
- Redeploy backend

---

**Method B: Using Vercel CLI**

**1. Install Vercel CLI**
```bash
npm install -g vercel
```

**2. Login**
```bash
vercel login
```

**3. Deploy Frontend**
```bash
cd frontend
vercel
```

**4. Follow Prompts**
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- What's your project's name? **biztrack**
- In which directory is your code located? **./
**
- Want to override settings? **Y**
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Development Command: `npm run dev`

**5. Add Environment Variable**
```bash
vercel env add VITE_API_URL
```
Paste your Railway backend URL

**6. Deploy to Production**
```bash
vercel --prod
```

---

## Alternative: Full Vercel Deployment with Vercel Postgres

If you want everything on Vercel, you'll need to use Vercel Postgres.

### Step 1: Create Vercel Postgres Database

**1. Go to Vercel Dashboard**
- Select your project (or create new)
- Go to "Storage" tab
- Click "Create Database"
- Select "Postgres"
- Choose region (closest to your users)
- Click "Create"

**2. Get Database Credentials**
- Vercel will show connection details
- Copy the connection string

### Step 2: Update Backend for PostgreSQL

This requires code changes. Let me create a PostgreSQL-compatible version:

**Create `backend/config/database-vercel.js`**:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;
```

**Update `backend/package.json`**:
Add `pg` dependency:
```json
{
  "dependencies": {
    "pg": "^8.11.0",
    ...existing dependencies
  }
}
```

**Note**: This requires significant code changes to migrate from SQLite to PostgreSQL. The hybrid approach (Frontend on Vercel + Backend on Railway) is much easier.

---

## Recommended: Hybrid Deployment

✅ **Frontend on Vercel** (Free, Fast, Global CDN)  
✅ **Backend on Railway** (Free tier, SQLite works, Persistent storage)

### Why This is Best:

1. **No Code Changes** - Works with existing SQLite
2. **Free Tier** - Both platforms have free tiers
3. **Fast Frontend** - Vercel's global CDN
4. **Persistent Database** - Railway supports file storage
5. **Easy Setup** - No database migration needed

---

## Configuration Files

### vercel.json (Frontend)

Already exists in your project:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ]
}
```

### Environment Variables

**Vercel (Frontend)**:
```
VITE_API_URL=https://your-railway-backend.railway.app
```

**Railway (Backend)**:
```
NODE_ENV=production
PORT=5001
JWT_SECRET=<your-strong-secret>
DATABASE_PATH=./data/biztrack.db
FRONTEND_URL=https://your-app.vercel.app
```

---

## Post-Deployment Steps

### 1. Test Your Deployment

**Test Backend** (Railway):
```bash
curl https://your-backend.railway.app/api/health
```

Expected:
```json
{
  "success": true,
  "message": "BizTrack API is running",
  "version": "3.0.0"
}
```

**Test Frontend** (Vercel):
- Open: `https://your-app.vercel.app`
- Should see login page
- Try registering
- Test features

### 2. Create Admin User

**Railway Terminal**:
1. Go to Railway dashboard
2. Click on backend service
3. Click "Settings" → "Connect"
4. Run:
```bash
cd backend
node create-admin.js
```

### 3. Configure Custom Domain (Optional)

**Vercel**:
- Go to project settings
- Click "Domains"
- Add your domain
- Update DNS records

**Railway**:
- Go to service settings
- Click "Domains"
- Add custom domain
- Update DNS records

---

## Troubleshooting

### Issue: "Cannot connect to backend"

**Check**:
1. Backend is deployed and running on Railway
2. `VITE_API_URL` in Vercel matches Railway backend URL
3. No trailing slash in URLs
4. CORS configured correctly

**Fix**:
```bash
# In Vercel, update environment variable
vercel env add VITE_API_URL
# Paste: https://your-backend.railway.app

# Redeploy
vercel --prod
```

### Issue: "CORS error"

**Fix**:
1. Go to Railway backend
2. Update `FRONTEND_URL` to match Vercel URL exactly
3. Redeploy backend

### Issue: "Build failed on Vercel"

**Check**:
1. Root directory is set to `frontend`
2. Build command is `npm run build`
3. Output directory is `dist`
4. Node version compatible (14+)

**Fix**:
```bash
# In frontend directory
npm install
npm run build
# If builds locally, should work on Vercel
```

---

## Cost Breakdown

### Vercel (Frontend)
- **Hobby Plan**: Free
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  - Global CDN

### Railway (Backend)
- **Free Tier**: $5 credit/month
  - ~500 hours runtime
  - Persistent storage
  - Automatic HTTPS

### Total Cost
- **$0/month** (within free tiers)
- Perfect for small to medium businesses

---

## Scaling

### When to Upgrade

**Vercel**:
- Upgrade to Pro ($20/month) when:
  - > 100 GB bandwidth/month
  - Need team collaboration
  - Need advanced analytics

**Railway**:
- Upgrade to Developer ($5/month) when:
  - Need more than $5 credit
  - > 500 hours runtime
  - Need more resources

---

## Monitoring

### Vercel Analytics
- Built-in analytics available
- View in Vercel dashboard
- Track page views, performance

### Railway Metrics
- Built-in metrics available
- View CPU, memory, network usage
- Real-time logs

### External Monitoring (Free)
- **Uptime Robot**: https://uptimerobot.com
- **Better Uptime**: https://betteruptime.com
- **Sentry** (errors): https://sentry.io

---

## Deployment Checklist

### Pre-Deployment
- [x] Code tested locally
- [x] All features working
- [ ] Generate strong JWT_SECRET
- [ ] Backend deployed to Railway
- [ ] Backend URL copied

### Vercel Deployment
- [ ] Vercel account created
- [ ] Project imported
- [ ] Root directory set to `frontend`
- [ ] Build settings configured
- [ ] Environment variable added (`VITE_API_URL`)
- [ ] Deployed successfully
- [ ] Frontend URL copied

### Post-Deployment
- [ ] Update Railway `FRONTEND_URL`
- [ ] Test backend health endpoint
- [ ] Test frontend loads
- [ ] Test registration
- [ ] Test login
- [ ] Test all features
- [ ] Create admin user
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring

---

## Quick Commands Reference

### Vercel CLI

```bash
# Install
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Deploy to production
vercel --prod

# Add environment variable
vercel env add VITE_API_URL

# View logs
vercel logs

# List deployments
vercel ls
```

### Railway CLI

```bash
# Install
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# View logs
railway logs

# Open shell
railway shell

# Add environment variable
railway variables set KEY=value
```

---

## Success Criteria

After deployment, verify:

✅ **Backend (Railway)**:
- Health endpoint returns 200
- Database persists data
- API endpoints working
- CORS configured

✅ **Frontend (Vercel)**:
- Loads without errors
- Can register account
- Can login
- Dashboard shows data
- All features working

✅ **Integration**:
- Frontend connects to backend
- Authentication works
- Data persists
- No CORS errors

---

## Next Steps

1. **Deploy Backend to Railway** (5 min)
   - Follow Step 1 above
   - Copy backend URL

2. **Deploy Frontend to Vercel** (3 min)
   - Follow Step 2 above
   - Use backend URL from step 1

3. **Test Everything** (5 min)
   - Register account
   - Test features
   - Verify data persists

4. **Create Admin User** (2 min)
   - Use Railway terminal
   - Run create-admin script

5. **Share with Users** 🎉
   - Send Vercel URL
   - Provide user guide
   - Start accepting users!

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Repository**: https://github.com/Aggreygisembaogeto/biztrack
- **Issues**: https://github.com/Aggreygisembaogeto/biztrack/issues

---

**Ready to deploy?**

**Step 1**: Deploy backend to Railway → https://railway.app  
**Step 2**: Deploy frontend to Vercel → https://vercel.com

**Total time**: ~10 minutes  
**Total cost**: $0 (free tiers)

🚀 Let's get your app live!
