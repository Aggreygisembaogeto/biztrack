# BizTrack - Architecture Summary

## Current State

Your BizTrack application now has **THREE different versions** to choose from, each suited for different use cases.

---

## Version 1: Separate Frontend & Backend (CURRENT - Recommended for Production)

### Structure
```
frontend/ (Port 3000)  ←→  backend/ (Port 5001)
   React App                Express API + SQLite
```

### How to Run
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Access
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5001/api`

### Pros ✅
- Clear separation of concerns
- Independent development
- Scalable architecture
- Can deploy frontend and backend separately
- Best for team collaboration
- Production-ready

### Cons ⚠️
- Need to run 2 servers
- CORS configuration required
- More complex setup

### Best For
- ✅ Production deployments
- ✅ Team development
- ✅ Large applications
- ✅ When you need flexibility
- ✅ When you want to scale independently

### Documentation
See: `SEPARATE_SETUP.md`

---

## Version 2: Unified Frontend & Backend

### Structure
```
server-unified.js (Port 5001)
   ├── Serves API (/api/*)
   └── Serves Frontend (built React app)
```

### How to Run
```bash
npm install
npm run build  # Build frontend
npm start      # Start unified server
```

### Access
- Everything: `http://localhost:5001`
- API: `http://localhost:5001/api`

### Pros ✅
- Single server
- No CORS issues
- Simpler deployment
- One port
- Easier for solo developers

### Cons ⚠️
- Less flexible
- Frontend and backend coupled
- Need to rebuild frontend for changes

### Best For
- ✅ Simple deployments
- ✅ Solo developers
- ✅ Small to medium projects
- ✅ When you want simplicity

### Documentation
See: `UNIFIED_SETUP.md`

---

## Version 3: Single File (Everything in One File)

### Structure
```
biztrack-single-file.js (Port 5001)
   ├── Express server
   ├── SQLite database
   ├── All API routes
   └── Frontend (embedded HTML/CSS/JS)
```

### How to Run
```bash
npm install express sqlite3 bcryptjs jsonwebtoken
node biztrack-single-file.js
```

### Access
- Everything: `http://localhost:5001`

### Pros ✅
- Literally one file
- Easiest to understand
- Perfect for learning
- Ultra-simple deployment
- No build step

### Cons ⚠️
- Limited features
- Hard to maintain
- Not scalable
- Basic UI only

### Best For
- ✅ Learning/teaching
- ✅ Quick demos
- ✅ Prototyping
- ✅ Understanding how everything works

### Documentation
See: `SINGLE_FILE_README.md`

---

## Database

### Location
- `backend/data/biztrack.db` (SQLite file)

### Important Notes
- ✅ **Gitignored** - Never committed to repository
- ✅ **Auto-created** - Created automatically on first run
- ✅ **Per-environment** - Each environment has its own database
- ✅ **Secure** - Contains user data, never exposed

### Tables
1. `users` - User accounts
2. `inventory` - Inventory items
3. `sales` - Sales transactions
4. `orders` - Customer orders
5. `transactions` - Financial transactions

### Why Database is NOT in Git
- Contains sensitive user data
- Contains business data
- Should be unique per environment
- Security best practice
- Each developer/server has their own database

---

## Comparison Table

| Feature | Separate | Unified | Single File |
|---------|----------|---------|-------------|
| **Files** | Many | Many | 1 |
| **Servers** | 2 | 1 | 1 |
| **Ports** | 3000 + 5001 | 5001 | 5001 |
| **Setup Time** | 5 min | 3 min | 1 min |
| **CORS** | Yes | No | No |
| **Build Step** | Yes | Yes | No |
| **Features** | Complete | Complete | Basic |
| **UI Quality** | Professional | Professional | Simple |
| **Scalability** | High | Medium | Low |
| **Maintenance** | Easy | Medium | Hard |
| **Team Work** | Excellent | Good | Poor |
| **Production** | ✅ Yes | ✅ Yes | ❌ No |
| **Learning** | Medium | Easy | Very Easy |

---

## Deployment Options

### All Versions Support

1. **Railway.app** (Recommended)
   - Easiest deployment
   - SQLite works perfectly
   - Free tier available
   - Auto-deploy on push

2. **Vercel**
   - Serverless deployment
   - Need external database (PostgreSQL)
   - Free tier available

3. **Traditional VPS**
   - DigitalOcean, Linode, AWS EC2
   - Full control
   - SQLite works perfectly

### Deployment Recommendations

**Separate Version**:
- Frontend → Vercel/Netlify
- Backend → Railway/Heroku

**Unified Version**:
- Everything → Railway/Vercel

**Single File**:
- Everything → Railway/Any VPS

---

## Which Version Should You Use?

### Use Separate (Version 1) If:
- ✅ You're deploying to production
- ✅ You have a team
- ✅ You need maximum flexibility
- ✅ You want to scale independently
- ✅ You're building a serious business application

**→ This is the RECOMMENDED version for production**

### Use Unified (Version 2) If:
- ✅ You're a solo developer
- ✅ You want simpler deployment
- ✅ You don't need separate scaling
- ✅ You want all features but simpler setup

### Use Single File (Version 3) If:
- ✅ You're learning how it works
- ✅ You need a quick demo
- ✅ You're prototyping
- ✅ You want to understand the code

---

## Current Repository Structure

```
biztrack/
├── frontend/                    # React application
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/                     # Express API
│   ├── routes/
│   ├── controllers/
│   ├── config/
│   ├── data/                   # Database (gitignored)
│   └── package.json
│
├── admin-panel/                # Admin panel (gitignored)
│
├── server-unified.js           # Unified server
├── biztrack-single-file.js     # Single file version
├── package.json                # Root package.json (for unified)
│
└── Documentation/
    ├── README.md               # Main readme
    ├── SEPARATE_SETUP.md       # Separate architecture guide
    ├── UNIFIED_SETUP.md        # Unified architecture guide
    ├── SINGLE_FILE_README.md   # Single file guide
    ├── DEPLOYMENT_READY.md     # Deployment verification
    ├── SECURITY.md             # Security documentation
    └── GETTING_STARTED.md      # User guide
```

---

## Quick Start Commands

### Separate Version (Recommended)
```bash
# Backend
cd backend && npm install && npm start

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

### Unified Version
```bash
npm install
npm run build
npm start
```

### Single File Version
```bash
npm install express sqlite3 bcryptjs jsonwebtoken
node biztrack-single-file.js
```

---

## What's Gitignored (Never Committed)

✅ **Ignored for Security**:
- `node_modules/` - Dependencies
- `.env` files - Environment variables
- `*.db` files - Database files
- `backend/data/` - Database directory
- `admin-panel/` - Admin panel
- `dist/` - Build output

❌ **Public (In Repository)**:
- Source code
- Documentation
- Configuration templates (`.env.example`)
- Package.json files

---

## Environment Variables

### Backend (.env)
```bash
PORT=5001
NODE_ENV=development
JWT_SECRET=your-secret-key-min-32-chars
DATABASE_PATH=./data/biztrack.db
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5001
```

---

## Security Features

All versions include:
- ✅ JWT authentication
- ✅ bcrypt password hashing
- ✅ SQL injection prevention
- ✅ CORS protection
- ✅ Environment variable protection
- ✅ Secure error handling

See `SECURITY.md` for complete details.

---

## Support & Documentation

### Documentation Files
- `README.md` - Project overview
- `SEPARATE_SETUP.md` - Separate architecture (current)
- `UNIFIED_SETUP.md` - Unified architecture
- `SINGLE_FILE_README.md` - Single file version
- `DEPLOYMENT_READY.md` - Deployment guide
- `SECURITY.md` - Security documentation
- `GETTING_STARTED.md` - User guide

### Repository
https://github.com/Aggreygisembaogeto/biztrack

### Issues
https://github.com/Aggreygisembaogeto/biztrack/issues

---

## Summary

✅ **Frontend and Backend are SEPARATE** (as requested)
✅ **Database is REMOVED from git** (as requested)
✅ **Database is gitignored** (never committed)
✅ **Three versions available** (separate, unified, single-file)
✅ **Complete documentation** (for all versions)
✅ **Production ready** (separate version)
✅ **Tested and working** (all versions)

**Recommended**: Use the **Separate Version** for production deployment.

---

**Version**: 3.0.0  
**Last Updated**: May 2, 2026  
**Status**: Production Ready  
**Architecture**: Separate Frontend & Backend (Recommended)
