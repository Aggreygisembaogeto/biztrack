# 🚀 BizTrack - Complete System Guide

**Version**: 3.0.0  
**Last Updated**: May 2, 2026  
**Status**: ✅ Production Ready

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Installation & Setup](#installation--setup)
7. [Deployment](#deployment)
8. [Environment Variables](#environment-variables)
9. [API Documentation](#api-documentation)
10. [Security](#security)
11. [Troubleshooting](#troubleshooting)
12. [User Guide](#user-guide)

---

## 🎯 System Overview

**BizTrack** is a comprehensive business management system designed for small to medium-sized businesses in Kenya. It provides real-time tracking of inventory, orders, sales, financial transactions, and business analytics.

### Key Capabilities
- Real-time inventory management with low-stock alerts
- Order tracking and management
- Financial transaction recording (income/expenses)
- Sales analytics and reporting
- AI-powered market advisor with Kenya market data
- Multi-user support with role-based access (Admin/User)
- PWA support for mobile devices
- Offline-capable with data sync

### Target Users
- Restaurant owners
- Retail shop owners
- Small business managers
- Entrepreneurs in Kenya

---

## 🏗️ Architecture

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │   Vercel         │         │    Railway       │     │
│  │   (Frontend)     │────────▶│    (Backend)     │     │
│  │                  │  HTTPS  │                  │     │
│  │  React + Vite    │         │  Node.js + API   │     │
│  │  Port: 443       │         │  Port: 5001      │     │
│  └──────────────────┘         └──────────────────┘     │
│         │                              │                │
│         │                              │                │
│         ▼                              ▼                │
│  Users Access App              SQLite Database          │
│  biztrack-dusky.vercel.app     (Auto-created)          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Local Development Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  DEVELOPMENT SETUP                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │   Frontend       │         │    Backend       │     │
│  │   localhost:3000 │────────▶│  localhost:5001  │     │
│  │                  │  HTTP   │                  │     │
│  │  npm run dev     │         │  npm start       │     │
│  └──────────────────┘         └──────────────────┘     │
│                                        │                │
│                                        ▼                │
│                              backend/data/biztrack.db   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### System Components

1. **Frontend (User Application)**
   - Location: `frontend/`
   - Framework: React 18 + Vite
   - UI: Tailwind CSS
   - State: Context API
   - Routing: React Router v6

2. **Backend (API Server)**
   - Location: `backend/`
   - Runtime: Node.js + Express
   - Database: SQLite (production-ready)
   - Auth: JWT + bcrypt
   - CORS: Configured for Vercel

3. **Admin Panel** (Hidden from GitHub)
   - Location: `admin-panel/` (local only)
   - Access: Admin role required
   - Features: User management, platform stats

---

## ✨ Features

### Core Features

**Inventory Management**
- Add, edit, delete products
- Track stock levels in real-time
- Low-stock alerts and notifications
- Bulk import/export
- Product categories and search

**Order Management**
- Create and track orders
- Order status workflow (Pending → Processing → Completed)
- Customer information
- Order history and search
- Print receipts

**Financial Tracking**
- Record income and expenses
- Categorize transactions
- View financial summaries
- Monthly/yearly reports
- Cash flow tracking

**Sales Analytics**
- Revenue charts and graphs
- Sales breakdown by product
- Daily/weekly/monthly trends
- Top-selling products
- Profit margins

**AI Market Advisor**
- Real-time Kenya market data
- Commodity price trends
- Seasonal intelligence
- Business recommendations
- Economic indicators

**User Management**
- Role-based access (Admin/User)
- User registration and login
- Profile management
- Password change
- OAuth support (Google, Facebook, GitHub)

**Reports & Analytics**
- Customizable date ranges
- Export to PDF/Excel
- Visual charts and graphs
- Business insights
- Performance metrics

### Advanced Features

- **PWA Support**: Install as mobile app
- **Offline Mode**: Works without internet
- **Real-time Updates**: Live data sync
- **Responsive Design**: Mobile-first UI
- **Dark Theme**: Eye-friendly interface
- **Multi-language**: Ready for localization

---

## 🛠️ Technology Stack

### Frontend
```
React 18.2.0          - UI framework
Vite 5.4.21           - Build tool
React Router 6.x      - Routing
Tailwind CSS 3.x      - Styling
Axios                 - HTTP client
React Toastify        - Notifications
React Icons           - Icon library
Chart.js              - Data visualization
```

### Backend
```
Node.js 18+           - Runtime
Express 4.18.2        - Web framework
SQLite3 5.1.7         - Database
JWT                   - Authentication
bcryptjs              - Password hashing
Passport              - OAuth
CORS                  - Cross-origin requests
dotenv                - Environment config
```

### Development Tools
```
Git                   - Version control
GitHub                - Code repository
Vercel                - Frontend hosting
Railway               - Backend hosting
npm                   - Package manager
```

---

## 📁 Project Structure

```
biztrack/
├── frontend/                    # User application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   ├── AIMarketAdvisor.jsx
│   │   │   └── ...
│   │   ├── pages/              # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Login.jsx
│   │   │   └── ...
│   │   ├── context/            # State management
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── utils/              # Utility functions
│   │   │   ├── api.js
│   │   │   └── storage.js
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── public/                 # Static assets
│   ├── .env.example            # Environment template
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # API server
│   ├── config/                 # Configuration files
│   │   ├── database-production.js
│   │   ├── database-postgres.js
│   │   └── passport.js
│   ├── controllers/            # Business logic
│   │   ├── authController-production.js
│   │   ├── inventoryController.js
│   │   ├── ordersController.js
│   │   ├── salesController.js
│   │   └── transactionController.js
│   ├── routes/                 # API routes
│   │   ├── auth-production.js
│   │   ├── inventory.js
│   │   ├── orders.js
│   │   ├── sales.js
│   │   └── transactions.js
│   ├── middleware/             # Custom middleware
│   │   └── auth.js
│   ├── migrations/             # Database migrations
│   ├── data/                   # Database files (gitignored)
│   ├── .env.example            # Environment template
│   ├── package.json
│   └── server-production.js    # Main server file
│
├── admin-panel/                # Admin application (hidden)
│   └── (similar structure to frontend)
│
├── .gitignore                  # Git ignore rules
├── README.md                   # Project overview
├── COMPLETE_SYSTEM_GUIDE.md    # This file
└── package.json                # Root package file
```

---

## 🚀 Installation & Setup

### Prerequisites

```bash
Node.js 18+ (LTS recommended)
npm 9+
Git
```

### Local Development Setup

**1. Clone Repository**
```bash
git clone https://github.com/Aggreygisembaogeto/biztrack.git
cd biztrack
```

**2. Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npm start
```

Backend runs on: `http://localhost:5001`

**3. Setup Frontend** (in new terminal)
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your settings
npm run dev
```

Frontend runs on: `http://localhost:3000`

**4. Create Admin User**
```bash
cd backend
node create-admin.js
# Follow prompts to create admin account
```

**5. Access Application**
- User App: `http://localhost:3000`
- Backend API: `http://localhost:5001/api`
- Health Check: `http://localhost:5001/api/health`

---

## 🌐 Deployment

### Production URLs
- **Frontend**: https://biztrack-dusky.vercel.app
- **Backend**: https://biztrack-production-134f.up.railway.app
- **Repository**: https://github.com/Aggreygisembaogeto/biztrack

### Deploy to Vercel (Frontend)

**1. Connect to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

**2. Configure Vercel**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**3. Set Environment Variables in Vercel Dashboard**
```
VITE_API_URL=https://biztrack-production-134f.up.railway.app
VITE_APP_NAME=BizTrack
```

**4. Redeploy**
After setting environment variables, redeploy from Vercel dashboard.

### Deploy to Railway (Backend)

**1. Connect Repository**
- Go to Railway.app
- Create new project
- Connect GitHub repository
- Select `backend` folder as root

**2. Configure Railway**
- Start Command: `npm start`
- Root Directory: `backend`

**3. Set Environment Variables in Railway Dashboard**
```
NODE_ENV=production
PORT=5001
JWT_SECRET=<generate-strong-random-secret>
FRONTEND_URL=https://biztrack-dusky.vercel.app
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**4. Deploy**
Railway auto-deploys on git push to main branch.

### Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in both platforms
- [ ] CORS configured (Vercel domain in backend)
- [ ] Database initialized (auto-created on first run)
- [ ] Admin user created
- [ ] Test registration and login
- [ ] Test all major features
- [ ] Check mobile responsiveness
- [ ] Verify PWA installation

---

## 🔐 Environment Variables

### Frontend (.env)

**Development:**
```bash
VITE_API_URL=http://localhost:5001
VITE_APP_NAME=BizTrack
VITE_APP_VERSION=3.0.0
```

**Production (Vercel):**
```bash
VITE_API_URL=https://biztrack-production-134f.up.railway.app
VITE_APP_NAME=BizTrack
VITE_APP_VERSION=3.0.0
```

### Backend (.env)

**Development:**
```bash
PORT=5001
NODE_ENV=development
JWT_SECRET=your-dev-secret-min-32-chars
FRONTEND_URL=http://localhost:3000
DATABASE_PATH=./data/biztrack.db
```

**Production (Railway):**
```bash
PORT=5001
NODE_ENV=production
JWT_SECRET=<strong-random-64-char-secret>
FRONTEND_URL=https://biztrack-dusky.vercel.app
DATABASE_PATH=./data/biztrack.db
```

### Security Notes

- ✅ Never commit `.env` files to git
- ✅ Use strong random secrets (32+ characters)
- ✅ Different secrets for dev/production
- ✅ Set variables in platform dashboards
- ✅ Rotate secrets regularly

---

## 📡 API Documentation

### Base URL
- Development: `http://localhost:5001/api`
- Production: `https://biztrack-production-134f.up.railway.app/api`

### Authentication

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "business_name": "My Business",
  "phone": "254712345678",
  "address": "Nairobi"
}

Response: { success: true, data: { token, user } }
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: { success: true, data: { token, user } }
```

**Get Current User**
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: { success: true, data: { user } }
```

### Inventory

**Get All Products**
```http
GET /api/inventory
Authorization: Bearer <token>

Response: { success: true, data: [products] }
```

**Create Product**
```http
POST /api/inventory
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "category": "Category",
  "quantity": 100,
  "unit": "pcs",
  "buying_price": 50,
  "selling_price": 80,
  "reorder_level": 20
}

Response: { success: true, data: { product } }
```

**Update Product**
```http
PUT /api/inventory/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "quantity": 150
}

Response: { success: true, data: { product } }
```

**Delete Product**
```http
DELETE /api/inventory/:id
Authorization: Bearer <token>

Response: { success: true, message: "Product deleted" }
```

### Orders

**Get All Orders**
```http
GET /api/orders
Authorization: Bearer <token>

Response: { success: true, data: [orders] }
```

**Create Order**
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer_name": "John Doe",
  "customer_phone": "254712345678",
  "items": [
    { "product_id": 1, "quantity": 2, "price": 80 }
  ],
  "total_amount": 160,
  "status": "pending"
}

Response: { success: true, data: { order } }
```

### Transactions

**Get All Transactions**
```http
GET /api/transactions
Authorization: Bearer <token>

Response: { success: true, data: [transactions] }
```

**Create Transaction**
```http
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "income",
  "category": "sales",
  "amount": 5000,
  "description": "Product sales",
  "date": "2026-05-02"
}

Response: { success: true, data: { transaction } }
```

### Sales

**Get Sales Stats**
```http
GET /api/sales/stats
Authorization: Bearer <token>

Response: { 
  success: true, 
  data: { 
    total_sales, 
    total_revenue, 
    average_order_value 
  } 
}
```

### Admin (Admin Role Required)

**Get All Users**
```http
GET /api/admin/users
Authorization: Bearer <admin-token>

Response: { success: true, data: [users] }
```

**Get Platform Stats**
```http
GET /api/admin/stats
Authorization: Bearer <admin-token>

Response: { 
  success: true, 
  data: { 
    total_users, 
    total_businesses, 
    active_users 
  } 
}
```

### Health Check

**Check API Status**
```http
GET /api/health

Response: { 
  success: true, 
  message: "BizTrack API is running",
  timestamp: "2026-05-02T...",
  version: "3.0.0"
}
```

---

## 🔒 Security

### Authentication & Authorization

**JWT Tokens**
- 30-day expiration
- Stored in localStorage
- Sent in Authorization header
- Verified on every protected route

**Password Security**
- bcrypt hashing (10 rounds)
- Minimum 6 characters
- No password in responses
- Secure password reset

**Role-Based Access**
- User role: Access own data
- Admin role: Access all data + admin panel
- Middleware protection on routes

### Data Security

**SQL Injection Prevention**
- Parameterized queries throughout
- No string concatenation in SQL
- Input validation on all endpoints

**XSS Protection**
- React auto-escapes output
- Content Security Policy headers
- No dangerouslySetInnerHTML

**CORS Configuration**
- Whitelist specific origins
- Credentials support
- Proper headers

### API Security

**Rate Limiting** (Recommended for production)
```javascript
// Add to backend
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

**HTTPS Only**
- Production uses HTTPS
- Secure cookies
- HSTS headers

### File Security

**Protected Files** (Never commit)
```
.env
backend/.env
frontend/.env
admin-panel/.env
backend/data/*.db
admin-panel/
```

**Public Files** (Safe to commit)
```
.env.example
backend/.env.example
frontend/.env.example
README.md
Documentation files
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue: Registration fails with 405 error**
```
Problem: CORS blocking requests
Solution: 
1. Check FRONTEND_URL is set in Railway
2. Verify Vercel domain is in CORS allowed origins
3. Check backend logs for CORS errors
```

**Issue: "VITE_API_URL not set" error**
```
Problem: Environment variable not loaded
Solution:
1. Set VITE_API_URL in Vercel dashboard
2. Redeploy Vercel (variables baked at build time)
3. Clear browser cache
```

**Issue: Database not found**
```
Problem: Database file doesn't exist
Solution:
Database auto-creates on first run. If issues:
1. Check DATABASE_PATH in .env
2. Ensure backend/data/ folder exists
3. Check file permissions
```

**Issue: JWT token invalid**
```
Problem: Token expired or JWT_SECRET mismatch
Solution:
1. Logout and login again
2. Check JWT_SECRET is same in backend
3. Clear localStorage
```

**Issue: Admin panel not accessible**
```
Problem: User doesn't have admin role
Solution:
1. Run: node backend/create-admin.js
2. Or: node backend/make-admin.js <email>
3. Check user.role === 'admin' in database
```

### Debug Tools

**Check Environment Variables**
Visit: `https://biztrack-dusky.vercel.app/env-test`
Shows all environment variables and tests backend connection.

**Check Backend Health**
Visit: `https://biztrack-production-134f.up.railway.app/api/health`
Should return: `{ success: true, message: "BizTrack API is running" }`

**Check API Endpoints**
Visit: `https://biztrack-production-134f.up.railway.app/api`
Shows all available endpoints.

**Browser Console**
Press F12 → Console tab
Check for errors when using the app.

**Network Tab**
Press F12 → Network tab
See all API requests and responses.

### Railway Logs

```bash
# View logs in Railway dashboard
1. Go to Railway project
2. Click on service
3. View "Logs" tab
4. Check for errors
```

### Vercel Logs

```bash
# View logs in Vercel dashboard
1. Go to Vercel project
2. Click on deployment
3. View "Logs" tab
4. Check build and runtime logs
```

---

## 👥 User Guide

### Getting Started

**1. Register Account**
- Go to app URL
- Click "Create Account"
- Fill in business details
- Click "Create Account"
- Auto-login after registration

**2. Dashboard Overview**
- View key metrics (revenue, orders, inventory)
- See recent activity
- Check low-stock alerts
- View sales charts

**3. Add Products**
- Go to Inventory page
- Click "Add Product"
- Fill in product details
- Set reorder level for alerts
- Click "Save"

**4. Create Orders**
- Go to Orders page
- Click "New Order"
- Add customer details
- Select products and quantities
- Review total
- Click "Create Order"

**5. Track Finances**
- Go to Financial Transactions
- Click "Add Transaction"
- Select type (Income/Expense)
- Choose category
- Enter amount and description
- Click "Save"

**6. View Reports**
- Go to Reports page
- Select date range
- Choose report type
- View charts and data
- Export to PDF/Excel

### Admin Features

**Access Admin Panel**
- Login with admin account
- Click profile → "Admin Panel"
- Or visit: `/admin`

**Manage Users**
- View all registered users
- See user activity
- Delete users if needed
- View user statistics

**Platform Stats**
- Total users
- Active businesses
- System health
- Usage metrics

### Mobile App

**Install as PWA**
1. Open app in mobile browser
2. Tap browser menu
3. Select "Add to Home Screen"
4. App installs like native app

**Offline Mode**
- App works without internet
- Data syncs when online
- View cached data offline

### Tips & Best Practices

**Inventory Management**
- Set realistic reorder levels
- Update stock regularly
- Use categories for organization
- Check low-stock alerts daily

**Order Processing**
- Update order status promptly
- Keep customer info accurate
- Print receipts for records
- Track order trends

**Financial Tracking**
- Record all transactions daily
- Categorize accurately
- Review monthly reports
- Track cash flow

**Security**
- Use strong passwords
- Logout on shared devices
- Don't share credentials
- Change password regularly

---

## 📊 System Status

### Current Version: 3.0.0

**Production Status**: ✅ Live and Running

**Deployment Status**:
- Frontend (Vercel): ✅ Active
- Backend (Railway): ✅ Active
- Database: ✅ Operational
- CORS: ✅ Configured
- Authentication: ✅ Working

**Known Issues**: None

**Recent Updates**:
- Fixed CORS for Vercel deployment
- Added environment test page
- Hardcoded Vercel domain in backend
- Updated PWA meta tags
- Improved mobile navigation

---

## 📞 Support & Contact

### Repository
https://github.com/Aggreygisembaogeto/biztrack

### Documentation
- README.md - Project overview
- COMPLETE_SYSTEM_GUIDE.md - This comprehensive guide
- SECURITY_CHECKLIST.md - Security best practices
- API_KEYS_SECURITY_REPORT.md - Security audit

### Getting Help

**For Issues**:
1. Check this guide first
2. Review troubleshooting section
3. Check GitHub issues
4. Create new issue with details

**For Questions**:
1. Review documentation
2. Check API documentation
3. Review code comments
4. Ask in discussions

---

## 🎉 Success Checklist

### Development Setup
- [ ] Node.js installed
- [ ] Repository cloned
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment variables configured
- [ ] Backend running on port 5001
- [ ] Frontend running on port 3000
- [ ] Admin user created
- [ ] Can login successfully

### Production Deployment
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Database initialized
- [ ] Can register new users
- [ ] Can login successfully
- [ ] All features working
- [ ] Mobile responsive
- [ ] PWA installable

### Security
- [ ] No .env files in git
- [ ] Strong JWT_SECRET generated
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Passwords hashed
- [ ] Admin panel protected
- [ ] Database files gitignored

---

## 📝 Quick Reference

### URLs
```
Production Frontend:  https://biztrack-dusky.vercel.app
Production Backend:   https://biztrack-production-134f.up.railway.app
GitHub Repository:    https://github.com/Aggreygisembaogeto/biztrack
Environment Test:     https://biztrack-dusky.vercel.app/env-test
API Health:           https://biztrack-production-134f.up.railway.app/api/health
```

### Commands
```bash
# Development
cd backend && npm start              # Start backend
cd frontend && npm run dev           # Start frontend
node backend/create-admin.js         # Create admin user

# Deployment
git push origin main                 # Deploy to Railway & Vercel
vercel --prod                        # Deploy frontend only

# Database
node backend/check-users.js          # List all users
node backend/make-admin.js <email>   # Make user admin
node backend/reset-password.js       # Reset user password

# Security
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # Generate JWT secret
```

### Default Ports
```
Frontend:  3000 (dev), 443 (prod)
Backend:   5001
Admin:     3001 (local only)
```

### Default Credentials
```
Create your own admin:
node backend/create-admin.js

Or use demo account (if created):
Email: demo@biztrack.com
Password: demo123
```

---

**🎊 Congratulations! Your BizTrack system is ready to use!**

For the latest updates and documentation, visit the GitHub repository.

---

**End of Complete System Guide**  
**Version 3.0.0 | May 2, 2026**
