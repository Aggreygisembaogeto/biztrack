# 🚀 Deploy BizTrack to Production - Step by Step

## Quick Deploy (5 Minutes)

### Option 1: Railway.app (Recommended - Easiest)

Railway is the **easiest and best option** for BizTrack because:
- ✅ SQLite database works perfectly (persistent storage)
- ✅ Free tier ($5 credit/month)
- ✅ Auto-deploy on git push
- ✅ Automatic HTTPS
- ✅ Zero configuration needed

#### Step-by-Step Railway Deployment

**1. Create Railway Account**
- Go to https://railway.app
- Click "Login with GitHub"
- Authorize Railway

**2. Create New Project**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose: `Aggreygisembaogeto/biztrack`
- Railway will detect it's a Node.js project

**3. Configure Backend Service**
- Railway creates a service automatically
- Click on the service
- Go to "Settings" tab
- Set **Root Directory**: `backend`
- Set **Start Command**: `npm start`

**4. Add Environment Variables**
- Click "Variables" tab
- Add these variables:

```
NODE_ENV=production
PORT=5001
JWT_SECRET=<click-generate-button-or-paste-your-secret>
DATABASE_PATH=./data/biztrack.db
FRONTEND_URL=https://your-frontend-url.railway.app
```

**Generate JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste as JWT_SECRET

**5. Deploy Backend**
- Click "Deploy"
- Wait 2-3 minutes
- Backend will be live at: `https://biztrack-backend-xxx.railway.app`
- Copy this URL (you'll need it for frontend)

**6. Create Frontend Service**
- In your project, click "New Service"
- Select "GitHub Repo" → Same repository
- Set **Root Directory**: `frontend`
- Set **Build Command**: `npm run build`
- Set **Start Command**: `npm run preview`

**7. Add Frontend Environment Variables**
- Click "Variables" tab
- Add:

```
VITE_API_URL=https://your-backend-url.railway.app
```
(Use the backend URL from step 5)

**8. Deploy Frontend**
- Click "Deploy"
- Wait 2-3 minutes
- Frontend will be live at: `https://biztrack-frontend-xxx.railway.app`

**9. Update Backend FRONTEND_URL**
- Go back to backend service
- Update `FRONTEND_URL` variable with your frontend URL
- Redeploy backend

**10. Create Admin User**
- In Railway, click on backend service
- Go to "Settings" → "Service"
- Click "Connect" to open terminal
- Run:
```bash
cd backend
node create-admin.js
```
- Follow prompts to create admin account

**🎉 Done! Your app is live!**

Share your frontend URL with users: `https://biztrack-frontend-xxx.railway.app`

---

### Option 2: Render.com (Also Easy)

**1. Create Render Account**
- Go to https://render.com
- Sign up with GitHub

**2. Deploy Backend**
- Click "New +" → "Web Service"
- Connect GitHub repository
- Configure:
  - **Name**: biztrack-backend
  - **Root Directory**: backend
  - **Environment**: Node
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`
  - **Plan**: Free

**3. Add Backend Environment Variables**
```
NODE_ENV=production
PORT=5001
JWT_SECRET=<your-generated-secret>
DATABASE_PATH=./data/biztrack.db
```

**4. Deploy Frontend**
- Click "New +" → "Static Site"
- Connect same repository
- Configure:
  - **Name**: biztrack-frontend
  - **Root Directory**: frontend
  - **Build Command**: `npm run build`
  - **Publish Directory**: dist

**5. Add Frontend Environment Variable**
```
VITE_API_URL=https://biztrack-backend.onrender.com
```

**6. Update Backend FRONTEND_URL**
- Go to backend service
- Add environment variable:
```
FRONTEND_URL=https://biztrack-frontend.onrender.com
```

**🎉 Done!**

---

### Option 3: Vercel (Frontend) + Railway (Backend)

**Best for**: Separate hosting, maximum performance

**Backend on Railway**:
- Follow Railway steps above for backend only

**Frontend on Vercel**:

**1. Install Vercel CLI**
```bash
npm install -g vercel
```

**2. Deploy Frontend**
```bash
cd frontend
vercel
```

**3. Add Environment Variable**
- Go to Vercel dashboard
- Select your project
- Settings → Environment Variables
- Add:
```
VITE_API_URL=https://your-railway-backend-url.railway.app
```

**4. Redeploy**
```bash
vercel --prod
```

**🎉 Done!**

---

## Pre-Deployment Checklist

Before deploying, ensure:

### Security ✅
- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Never use default secrets in production
- [ ] Environment variables configured
- [ ] Database files gitignored
- [ ] Admin panel hidden from repository

### Configuration ✅
- [ ] Backend environment variables set
- [ ] Frontend environment variables set
- [ ] CORS configured with production URLs
- [ ] Database path configured

### Testing ✅
- [ ] Test locally first
- [ ] All features working
- [ ] Authentication working
- [ ] Database operations working

---

## Post-Deployment Steps

### 1. Create Admin User

**Railway**:
- Open backend service terminal
- Run: `node backend/create-admin.js`

**Render**:
- Go to backend service
- Click "Shell"
- Run: `cd backend && node create-admin.js`

**Follow prompts**:
```
Enter admin email: admin@yourbusiness.com
Enter admin password: <strong-password>
Enter business name: Your Business Name
```

### 2. Test Your Deployment

**Test Backend**:
```bash
curl https://your-backend-url.railway.app/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "BizTrack API is running",
  "version": "3.0.0"
}
```

**Test Frontend**:
- Open: `https://your-frontend-url.railway.app`
- Should see login page
- Try registering a test account
- Login and test features

### 3. Configure Custom Domain (Optional)

**Railway**:
- Go to service settings
- Click "Domains"
- Add custom domain
- Update DNS records as shown

**Vercel**:
- Go to project settings
- Click "Domains"
- Add custom domain
- Update DNS records

### 4. Set Up Monitoring

**Railway**:
- Built-in metrics available
- View logs in real-time
- Set up alerts

**External Monitoring** (Free):
- **Uptime Robot**: https://uptimerobot.com
- **Better Uptime**: https://betteruptime.com
- **Sentry** (errors): https://sentry.io

---

## Environment Variables Reference

### Backend (.env)

**Required**:
```bash
NODE_ENV=production
PORT=5001
JWT_SECRET=<32-char-random-string>
DATABASE_PATH=./data/biztrack.db
FRONTEND_URL=https://your-frontend-url.com
```

**Optional** (for features):
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# M-Pesa Payments
MPESA_CONSUMER_KEY=your-mpesa-key
MPESA_CONSUMER_SECRET=your-mpesa-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
```

### Frontend (.env.production)

```bash
VITE_API_URL=https://your-backend-url.com
```

---

## Generate Strong JWT Secret

**Method 1 - Node.js**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Method 2 - OpenSSL**:
```bash
openssl rand -hex 32
```

**Method 3 - Online**:
- Go to: https://www.random.org/strings/
- Generate 32-character string
- Use alphanumeric characters

---

## Troubleshooting

### Issue: "Cannot connect to backend"

**Solution**:
1. Check backend is deployed and running
2. Verify `VITE_API_URL` in frontend matches backend URL
3. Check CORS configuration in backend
4. Ensure `FRONTEND_URL` in backend matches frontend URL

### Issue: "Database errors"

**Solution**:
1. Check `DATABASE_PATH` is set correctly
2. Ensure platform supports persistent storage (Railway does, Vercel doesn't)
3. Check database directory exists

### Issue: "Authentication not working"

**Solution**:
1. Verify `JWT_SECRET` is set and same across deployments
2. Check token expiry (30 days default)
3. Clear browser localStorage and try again

### Issue: "CORS errors"

**Solution**:
1. Update `FRONTEND_URL` in backend environment variables
2. Ensure it matches your frontend URL exactly
3. Redeploy backend after changing

---

## Cost Estimates

### Railway.app
- **Free Tier**: $5 credit/month
- **Usage**: ~$0-5/month for small business
- **Includes**: Hosting, database, SSL, monitoring

### Render.com
- **Free Tier**: Available
- **Limitations**: Spins down after inactivity
- **Paid**: $7/month for always-on

### Vercel
- **Hobby**: Free (100GB bandwidth)
- **Pro**: $20/month (1TB bandwidth)

### Recommended for Small Business
- **Railway**: $0-5/month (best value)
- **Render**: $7/month (if you need always-on)
- **Vercel + Railway**: $0-5/month (best performance)

---

## Scaling Considerations

### When to Scale

**Stay on Free/Basic Tier If**:
- < 100 users
- < 1000 transactions/day
- < 10GB data

**Upgrade When**:
- > 100 concurrent users
- > 10,000 transactions/day
- > 50GB data
- Need 99.9% uptime SLA

### Scaling Options

**Database**:
- Migrate from SQLite to PostgreSQL
- Use managed database (Railway Postgres, Supabase)

**Backend**:
- Add more instances
- Use load balancer
- Enable caching (Redis)

**Frontend**:
- Use CDN (Cloudflare, Vercel Edge)
- Enable caching
- Optimize bundle size

---

## Backup Strategy

### Automated Backups

**Railway**:
- Database is persistent
- Set up manual backup script

**Backup Script** (run daily):
```bash
# On your server or Railway shell
cp backend/data/biztrack.db backend/data/backup-$(date +%Y%m%d).db

# Upload to cloud storage (optional)
# aws s3 cp backend/data/biztrack.db s3://your-bucket/backups/
```

### Manual Backup

**Download Database**:
1. Connect to Railway shell
2. Run: `cat backend/data/biztrack.db | base64`
3. Copy output
4. Decode and save locally

---

## Security Best Practices

### Before Going Live

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS (automatic on Railway/Vercel)
- [ ] Set up rate limiting (optional)
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerts
- [ ] Regular backups scheduled
- [ ] Test all authentication flows
- [ ] Review error handling
- [ ] Check for exposed secrets

### After Going Live

- [ ] Monitor error logs daily
- [ ] Check uptime status
- [ ] Review user feedback
- [ ] Update dependencies regularly
- [ ] Backup database weekly
- [ ] Test disaster recovery
- [ ] Monitor performance metrics

---

## User Onboarding

### Share with Users

**1. Send Them the URL**:
```
Your BizTrack app is live at:
https://your-app-url.railway.app

Create your account and start managing your business!
```

**2. Provide Quick Start Guide**:
- Click "Create Account"
- Enter your business details
- Start adding inventory
- Record your first sale

**3. Share Documentation**:
- User guide: See `GETTING_STARTED.md`
- Features list: See `README.md`
- Support: GitHub Issues

---

## Maintenance

### Regular Tasks

**Daily**:
- Check error logs
- Monitor uptime

**Weekly**:
- Review user feedback
- Check performance metrics
- Backup database

**Monthly**:
- Update dependencies
- Review security
- Check costs
- Plan improvements

---

## Support

### For Deployment Issues
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs

### For App Issues
- **GitHub**: https://github.com/Aggreygisembaogeto/biztrack
- **Issues**: https://github.com/Aggreygisembaogeto/biztrack/issues
- **Documentation**: See README.md and other docs

---

## Quick Reference

### Railway Deployment Commands

```bash
# Install Railway CLI
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

### Useful URLs

- **Railway Dashboard**: https://railway.app/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Your Repository**: https://github.com/Aggreygisembaogeto/biztrack

---

## Success Checklist

After deployment, verify:

- [ ] Backend is accessible and returns health check
- [ ] Frontend loads and shows login page
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Dashboard loads with data
- [ ] Can add inventory item
- [ ] Can record sale
- [ ] Can create order
- [ ] Can add transaction
- [ ] Can view reports
- [ ] Admin user created
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Backups scheduled
- [ ] Users can access the app

---

## 🎉 You're Ready!

Your BizTrack application is now:
- ✅ Deployed to production
- ✅ Accessible to users worldwide
- ✅ Secure and scalable
- ✅ Ready for business

**Next Step**: Deploy to Railway now! It takes just 5 minutes.

Go to: https://railway.app

---

**Version**: 3.0.0  
**Last Updated**: May 2, 2026  
**Status**: Production Ready  
**Deployment**: Railway.app Recommended
