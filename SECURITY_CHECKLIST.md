# 🔒 Security Checklist - API Keys & Secrets

## ✅ Current Security Status

### Protected Files (Already Secured)
- ✅ `.env` files are in `.gitignore`
- ✅ No `.env` files in git history
- ✅ Database files are gitignored
- ✅ Admin panel is hidden from GitHub
- ✅ Only `.env.example` files are public (with placeholder values)

---

## 🔐 Environment Variables Security

### What's Protected

**Local Development (.env files)**:
- ❌ **NEVER commit** `.env` files to git
- ✅ **Always use** `.env.example` with placeholder values
- ✅ **Keep real secrets** only in local `.env` files

**Production (Railway & Vercel)**:
- ✅ Set environment variables in dashboard (not in code)
- ✅ Use strong, randomly generated secrets
- ✅ Never share production secrets

---

## 🔑 Required Secrets

### 1. JWT_SECRET (Required)

**Purpose**: Signs authentication tokens

**Generate Strong Secret**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Where to Set**:
- **Local**: `backend/.env`
- **Railway**: Variables tab → `JWT_SECRET`
- **Vercel**: Not needed (backend only)

**Requirements**:
- Minimum 32 characters
- Use random alphanumeric string
- Different for each environment (dev, staging, production)

---

### 2. FRONTEND_URL (Required for Production)

**Purpose**: CORS protection

**Where to Set**:
- **Railway**: Variables tab → `FRONTEND_URL`

**Value**:
- Development: `http://localhost:3000`
- Production: `https://your-app.vercel.app` (your actual Vercel URL)

---

### 3. VITE_API_URL (Required for Production)

**Purpose**: Frontend knows where backend is

**Where to Set**:
- **Vercel**: Settings → Environment Variables → `VITE_API_URL`

**Value**:
- Development: `http://localhost:5001`
- Production: `https://biztrack-production-134f.up.railway.app`

---

## 🚫 What NOT to Commit

### Never Commit These Files:
```
.env
.env.local
.env.development
.env.production
backend/.env
frontend/.env
admin-panel/.env
*.db
*.sqlite
backend/data/*.db
admin-panel/
```

### Safe to Commit:
```
.env.example
backend/.env.example
frontend/.env.example
README.md
Documentation files
```

---

## 🔍 How to Check for Exposed Secrets

### 1. Check Git Status
```bash
git status
```
Should NOT show any `.env` files

### 2. Check Git History
```bash
git log --all --full-history -- .env backend/.env frontend/.env
```
Should return empty (no commits)

### 3. Check GitHub Repository
- Go to: https://github.com/Aggreygisembaogeto/biztrack
- Search for: `.env`
- Should only find `.env.example` files

### 4. Check for Hardcoded Secrets
```bash
# Search for potential hardcoded secrets
git grep -i "password.*=" -- "*.js" "*.jsx"
git grep -i "secret.*=" -- "*.js" "*.jsx"
git grep -i "api.*key.*=" -- "*.js" "*.jsx"
```

---

## 🛡️ OAuth Secrets (Optional)

If you're using social login (Google, Facebook, GitHub):

### Google OAuth
- Get from: https://console.cloud.google.com/
- Set in Railway:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_CALLBACK_URL`

### GitHub OAuth
- Get from: https://github.com/settings/developers
- Set in Railway:
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
  - `GITHUB_CALLBACK_URL`

### Facebook OAuth
- Get from: https://developers.facebook.com/
- Set in Railway:
  - `FACEBOOK_APP_ID`
  - `FACEBOOK_APP_SECRET`
  - `FACEBOOK_CALLBACK_URL`

**Important**: 
- Never commit these to git
- Set them only in Railway dashboard
- Use different values for development and production

---

## 🔐 M-Pesa Secrets (Optional)

If you're using M-Pesa payments:

### Required Variables
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`

**Get from**: Safaricom Daraja Portal

**Set in**: Railway Variables tab only

---

## 📋 Environment Variables Checklist

### Local Development

**backend/.env**:
```bash
PORT=5001
NODE_ENV=development
JWT_SECRET=<generate-random-32-chars>
FRONTEND_URL=http://localhost:3000
```

**frontend/.env**:
```bash
VITE_API_URL=http://localhost:5001
VITE_APP_NAME=BizTrack
```

### Production - Railway (Backend)

```bash
NODE_ENV=production
PORT=5001
JWT_SECRET=<strong-random-secret-64-chars>
FRONTEND_URL=https://your-app.vercel.app
```

### Production - Vercel (Frontend)

```bash
VITE_API_URL=https://biztrack-production-134f.up.railway.app
VITE_APP_NAME=BizTrack
```

---

## 🚨 If Secrets Were Exposed

If you accidentally committed secrets to git:

### 1. Remove from Git History
```bash
# Remove file from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: This rewrites history)
git push origin --force --all
```

### 2. Rotate All Secrets
- Generate new JWT_SECRET
- Regenerate OAuth credentials
- Update all environment variables in Railway/Vercel

### 3. Verify Removal
- Check GitHub repository
- Search for old secrets
- Confirm they're gone

---

## ✅ Best Practices

### DO:
- ✅ Use `.env.example` with placeholder values
- ✅ Generate strong random secrets (32+ characters)
- ✅ Use different secrets for dev/staging/production
- ✅ Set secrets in platform dashboards (Railway/Vercel)
- ✅ Keep `.env` files in `.gitignore`
- ✅ Regularly rotate production secrets
- ✅ Use environment-specific callback URLs for OAuth

### DON'T:
- ❌ Commit `.env` files to git
- ❌ Share secrets in chat/email/Slack
- ❌ Use weak or default secrets in production
- ❌ Hardcode secrets in source code
- ❌ Use same secrets across environments
- ❌ Share production secrets with developers
- ❌ Store secrets in documentation

---

## 🔒 Additional Security Measures

### 1. Database Security
- ✅ Database files are gitignored
- ✅ Passwords are hashed with bcrypt
- ✅ SQL injection prevention with parameterized queries

### 2. Authentication Security
- ✅ JWT tokens with expiration
- ✅ Secure password hashing (bcrypt, 10 rounds)
- ✅ Token stored in localStorage (consider httpOnly cookies for production)

### 3. API Security
- ✅ CORS configured with allowed origins
- ✅ Rate limiting (consider adding in production)
- ✅ Input validation on all endpoints

### 4. Frontend Security
- ✅ No secrets in frontend code
- ✅ API URL from environment variables
- ✅ XSS protection headers

---

## 📞 Security Incident Response

If you suspect a security breach:

1. **Immediately**:
   - Rotate all secrets (JWT_SECRET, OAuth credentials)
   - Check Railway/Vercel logs for suspicious activity
   - Review recent git commits

2. **Investigate**:
   - Check GitHub for exposed secrets
   - Review access logs
   - Identify what was exposed

3. **Remediate**:
   - Remove secrets from git history
   - Update all environment variables
   - Force logout all users (change JWT_SECRET)
   - Notify affected users if necessary

4. **Prevent**:
   - Review security practices
   - Add pre-commit hooks to prevent secret commits
   - Implement secret scanning tools

---

## 🎯 Quick Security Audit

Run these commands to verify security:

```bash
# 1. Check no .env files are tracked
git ls-files | grep "\.env$"
# Should return nothing

# 2. Check .gitignore is working
git status
# Should not show .env files

# 3. Check no secrets in code
git grep -i "jwt_secret.*=" -- "*.js" "*.jsx"
# Should only show .env.example files

# 4. Verify .gitignore
cat .gitignore | grep "\.env"
# Should show .env patterns
```

---

## ✅ Your Current Status

**Good News**: 
- ✅ No secrets in git history
- ✅ `.gitignore` properly configured
- ✅ Only `.env.example` files are public
- ✅ Admin panel is hidden
- ✅ Database files are protected

**Action Required**:
- ⚠️ Generate strong JWT_SECRET for production (Railway)
- ⚠️ Set FRONTEND_URL in Railway
- ⚠️ Set VITE_API_URL in Vercel

---

**Last Updated**: 2026-05-02
**Status**: ✅ Secure
