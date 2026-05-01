# 🚀 GitHub Setup Instructions

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the **"+"** icon in the top right
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `biztrack` (or your preferred name)
   - **Description**: "Business management platform with user and admin applications"
   - **Visibility**: Choose **Public** or **Private**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

## Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/biztrack.git

# Verify remote was added
git remote -v

# Push to GitHub
git push -u origin master
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## Step 3: Verify Upload

1. Go to your repository on GitHub
2. Verify these files are present:
   - ✅ README.md
   - ✅ START_HERE.md
   - ✅ PRODUCTION_DEPLOYMENT_GUIDE.md
   - ✅ SECURITY.md
   - ✅ .gitignore
   - ✅ deploy.sh
   - ✅ frontend/, admin-panel/, backend/ folders

3. Verify these files are **NOT** present:
   - ❌ backend/.env
   - ❌ frontend/.env
   - ❌ admin-panel/.env
   - ❌ backend/data/biztrack.db
   - ❌ Any .log files
   - ❌ node_modules/

## Step 4: Add Repository Secrets (For CI/CD - Optional)

If you plan to use GitHub Actions for deployment:

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:
   - `JWT_SECRET` - Your production JWT secret
   - `SERVER_HOST` - Your server IP/domain
   - `SERVER_USER` - SSH username
   - `SSH_PRIVATE_KEY` - Your SSH private key

## Alternative: Using SSH

If you prefer SSH over HTTPS:

```bash
# Add remote using SSH
git remote add origin git@github.com:YOUR_USERNAME/biztrack.git

# Push to GitHub
git push -u origin master
```

**Note**: You need to have SSH keys set up with GitHub first.

## Quick Commands Reference

```bash
# Check current remotes
git remote -v

# Add remote (HTTPS)
git remote add origin https://github.com/YOUR_USERNAME/biztrack.git

# Add remote (SSH)
git remote add origin git@github.com:YOUR_USERNAME/biztrack.git

# Push to GitHub
git push -u origin master

# Future pushes (after first push)
git push

# Pull latest changes
git pull

# Check status
git status

# View commit history
git log --oneline
```

## Troubleshooting

### Error: "remote origin already exists"
```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/biztrack.git
```

### Error: "failed to push some refs"
```bash
# Pull first, then push
git pull origin master --allow-unrelated-histories
git push -u origin master
```

### Error: "Permission denied (publickey)"
You need to set up SSH keys. Use HTTPS instead:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/biztrack.git
```

## Security Reminder

✅ **Before pushing, always verify:**

```bash
# Check what will be pushed
git status

# Verify sensitive files are ignored
git check-ignore backend/.env
git check-ignore frontend/.env
git check-ignore admin-panel/.env
git check-ignore backend/data/biztrack.db

# All should return the filename (meaning they're ignored)
```

❌ **Never push:**
- `.env` files
- `.db` files
- `.log` files
- `node_modules/`
- Any files with passwords, API keys, or secrets

## After Pushing to GitHub

1. **Update README** - Add your repository URL
2. **Add Topics** - Tag your repo (nodejs, react, express, business-management)
3. **Add Description** - Brief description of your project
4. **Enable Issues** - For bug tracking
5. **Add License** - Choose appropriate license (MIT recommended)
6. **Create Releases** - Tag versions (v1.0.0, v2.0.0, etc.)

## Collaborating

To allow others to contribute:

1. Go to **Settings** → **Collaborators**
2. Click **Add people**
3. Enter their GitHub username
4. They'll receive an invitation

## Keeping Repository Updated

```bash
# After making changes
git add .
git commit -m "Description of changes"
git push

# Pull latest changes from GitHub
git pull
```

---

**Ready to push?** Follow Step 2 above!

**Last Updated**: May 1, 2026
