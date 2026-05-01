# 🔒 Security Guidelines

## Sensitive Files (Never Commit These!)

The following files contain sensitive information and are excluded from git:

### Environment Files
- `backend/.env` - Contains JWT secret, OAuth credentials
- `frontend/.env` - Contains API URLs
- `admin-panel/.env` - Contains API URLs
- Any file matching `*.env` (except `*.env.example`)

### Database Files
- `backend/data/biztrack.db` - Contains all user data
- Any file matching `*.db`, `*.sqlite`, `*.sqlite3`

### Logs
- All `*.log` files
- `logs/` directory

### Build Outputs
- `dist/` - Built frontend files
- `build/` - Built files
- `deployment/` - Deployment package
- `node_modules/` - Dependencies

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd biztrack
```

### 2. Create Environment Files

**Backend** - Copy and configure:
```bash
cd backend
cp .env.example .env
nano .env  # Edit with your values
```

**Frontend** - Copy and configure:
```bash
cd frontend
cp .env.example .env
nano .env  # Edit with your values
```

**Admin Panel** - Copy and configure:
```bash
cd admin-panel
cp .env.example .env
nano .env  # Edit with your values
```

### 3. Important: Change Default Values

⚠️ **CRITICAL**: Change these values in production:

- `JWT_SECRET` - Use a strong random string (64+ characters)
- OAuth credentials - Use your own API keys
- Admin password - Change from default `admin123`

### 4. Generate Strong JWT Secret

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output to `JWT_SECRET` in `backend/.env`

## What's Safe to Commit

✅ **Safe to commit:**
- `*.env.example` files (templates without real credentials)
- Source code files
- Documentation
- Configuration templates
- `package.json` files

❌ **Never commit:**
- `*.env` files (contain real credentials)
- `*.db` files (contain user data)
- `*.log` files (may contain sensitive info)
- `node_modules/` (dependencies)
- Build outputs (`dist/`, `build/`)

## Checking Before Commit

Always verify before committing:

```bash
# Check what will be committed
git status

# Verify sensitive files are ignored
git check-ignore backend/.env
git check-ignore frontend/.env
git check-ignore admin-panel/.env
git check-ignore backend/data/biztrack.db

# If any return empty, they're NOT ignored - DO NOT COMMIT!
```

## If You Accidentally Commit Secrets

If you accidentally commit sensitive data:

1. **Immediately** change all exposed credentials
2. Remove from git history:
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all
```
3. Force push (if already pushed):
```bash
git push origin --force --all
```
4. Rotate all exposed secrets (JWT secret, OAuth keys, passwords)

## Production Security Checklist

Before deploying to production:

- [ ] All `.env` files use strong, unique values
- [ ] JWT secret is 64+ characters random string
- [ ] Default admin password changed
- [ ] OAuth credentials are production keys
- [ ] Database has proper permissions
- [ ] HTTPS/SSL enabled
- [ ] Firewall configured
- [ ] Regular backups enabled
- [ ] Monitoring set up

## Reporting Security Issues

If you find a security vulnerability, please email: [your-email@example.com]

**Do not** create a public GitHub issue for security vulnerabilities.

---

**Last Updated**: May 1, 2026  
**Version**: 3.0.0
