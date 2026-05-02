# Deploy BizTrack to Vercel

## Quick Deployment Guide

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel**
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `Aggreygisembaogeto/biztrack`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   NODE_ENV=production
   JWT_SECRET=<generate-strong-random-string>
   DATABASE_PATH=./backend/data/biztrack.db
   PORT=5001
   ```

   **Generate JWT_SECRET**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Your app will be live at: `https://biztrack-xxx.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow prompts**:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? **biztrack**
   - In which directory is your code located? **./
   **

5. **Set environment variables**
   ```bash
   vercel env add JWT_SECRET
   # Paste your generated secret
   
   vercel env add NODE_ENV
   # Enter: production
   
   vercel env add DATABASE_PATH
   # Enter: ./backend/data/biztrack.db
   ```

6. **Deploy to production**
   ```bash
   vercel --prod
   ```

## Important Notes

### Database Considerations

⚠️ **SQLite on Vercel has limitations**:
- Vercel uses serverless functions (stateless)
- SQLite database will reset on each deployment
- File system is read-only in production

**Solutions**:

**Option 1: Use Vercel Postgres (Recommended)**
```bash
# Install Vercel Postgres
vercel postgres create

# Update your database config to use PostgreSQL
```

**Option 2: Use External Database**
- Railway Postgres (free tier)
- Supabase (free tier)
- PlanetScale (free tier)
- Neon (free tier)

**Option 3: Deploy to Railway Instead**
Railway supports SQLite with persistent storage. See below.

### Environment Variables

After deployment, you can manage environment variables:

**Via Dashboard**:
1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add/Edit variables
4. Redeploy for changes to take effect

**Via CLI**:
```bash
# Add variable
vercel env add VARIABLE_NAME

# List variables
vercel env ls

# Remove variable
vercel env rm VARIABLE_NAME
```

### Custom Domain

1. Go to your project on Vercel
2. Settings → Domains
3. Add your domain: `yourdomain.com`
4. Follow DNS configuration instructions
5. Vercel automatically provisions SSL certificate

## Alternative: Deploy to Railway (Better for SQLite)

Railway supports persistent file storage, making it better for SQLite databases.

### Deploy to Railway

1. **Create account** at https://railway.app

2. **New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `Aggreygisembaogeto/biztrack`

3. **Railway auto-detects**:
   - Node.js project
   - Runs `npm install`
   - Runs `npm run build` (from package.json)
   - Runs `npm start`

4. **Add environment variables**:
   - Click on your service
   - Go to "Variables" tab
   - Add:
     ```
     NODE_ENV=production
     JWT_SECRET=<your-strong-secret>
     DATABASE_PATH=./backend/data/biztrack.db
     PORT=5001
     ```

5. **Deploy**:
   - Railway automatically deploys
   - Provides URL: `https://biztrack-production.up.railway.app`

6. **Enable persistent storage**:
   - Railway automatically provides persistent volumes
   - Your SQLite database will persist across deployments

### Railway Advantages
- ✅ Persistent file storage (SQLite works)
- ✅ Automatic HTTPS
- ✅ Free tier available ($5 credit/month)
- ✅ Easy database backups
- ✅ Simple deployment process
- ✅ Auto-deploy on git push

## Testing Your Deployment

### 1. Test Health Endpoint
```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "BizTrack Unified Server is running",
  "timestamp": "2026-05-02T..."
}
```

### 2. Test Frontend
Open browser: `https://your-app.vercel.app`

You should see the BizTrack login page.

### 3. Test Registration
1. Go to `/register`
2. Create a test account
3. Verify you can login

### 4. Test API
```bash
# Register user
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "password123",
    "businessName": "Test Business"
  }'

# Login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "password123"
  }'
```

## Troubleshooting

### Build Fails

**Error**: "Cannot find module"
**Solution**: Make sure all dependencies are in `package.json`
```bash
npm install <missing-package> --save
git commit -am "Add missing dependency"
git push
```

### Database Errors

**Error**: "SQLITE_CANTOPEN: unable to open database file"
**Solution**: 
- On Vercel: Switch to PostgreSQL or deploy to Railway
- Check DATABASE_PATH environment variable

### API Routes Not Working

**Error**: 404 on `/api/*` routes
**Solution**: Check `vercel.json` routing configuration

### Frontend Not Loading

**Error**: Blank page or 404
**Solution**: 
- Verify frontend built successfully: `npm run build`
- Check `frontend/dist` directory exists
- Verify `server-unified.js` serves static files

### Environment Variables Not Working

**Solution**:
1. Check variables are set in Vercel dashboard
2. Redeploy after adding variables
3. Check variable names match exactly

## Monitoring

### View Logs

**Vercel Dashboard**:
1. Go to your project
2. Click on a deployment
3. View "Functions" tab for logs

**Vercel CLI**:
```bash
vercel logs
```

### Performance Monitoring

Vercel provides:
- Request analytics
- Performance metrics
- Error tracking
- Usage statistics

Access via: Project → Analytics

## Updating Your Deployment

### Automatic Deployment
Vercel automatically deploys when you push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel detects the push and deploys automatically.

### Manual Deployment
```bash
vercel --prod
```

## Cost

### Vercel Pricing
- **Hobby (Free)**:
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  - Good for personal projects

- **Pro ($20/month)**:
  - 1 TB bandwidth
  - Team collaboration
  - Better performance
  - Priority support

### Railway Pricing
- **Free Tier**:
  - $5 credit/month
  - ~500 hours runtime
  - Persistent storage
  - Good for small apps

- **Developer ($5/month)**:
  - $5 credit + pay as you go
  - Better for production

## Recommendation

**For BizTrack**:
- **Use Railway** if you want to keep SQLite (persistent storage)
- **Use Vercel + PostgreSQL** if you want serverless (requires DB migration)
- **Use VPS** (DigitalOcean, Linode) for full control and lowest cost at scale

**Best Option**: Railway.app
- Easiest setup
- SQLite works out of the box
- Free tier sufficient for small businesses
- Automatic deployments
- Persistent storage

## Next Steps

1. Choose deployment platform (Railway recommended)
2. Deploy your application
3. Set up custom domain (optional)
4. Create admin user:
   ```bash
   # SSH into your deployment or use Railway CLI
   cd backend
   node create-admin.js
   ```
5. Test all features
6. Share with users!

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- GitHub Issues: https://github.com/Aggreygisembaogeto/biztrack/issues

**Version**: 3.0.0  
**Last Updated**: May 2, 2026
