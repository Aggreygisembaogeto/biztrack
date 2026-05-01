# 🚀 BizTrack - Quick Start Guide

## ✅ Your Application is Ready!

**Version**: 3.0.0 (Production Ready)  
**Status**: ✅ Fully Functional with Real Authentication

---

## 🎯 What's Running

Your BizTrack application is currently running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## 🔐 Authentication System

### Real Database Authentication
- ✅ SQLite database (no setup required)
- ✅ Secure password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ 30-day session duration
- ✅ Email validation
- ✅ Password strength check
- ✅ Profile management
- ✅ Password change functionality

### Database Location
`backend/data/biztrack.db`

All user data, sales, inventory, and orders are saved here.

---

## 🎬 How to Use

### 1. Create Your Account

1. Go to http://localhost:3000/register
2. Fill in:
   - **Email**: your@email.com
   - **Password**: (min 6 characters)
   - **Business Name**: Your Business Name
   - **Phone**: 254712345678 (optional)
   - **Address**: Your address (optional)
3. Click **"Register"**
4. ✅ You're automatically logged in!

### 2. Or Login

1. Go to http://localhost:3000/login
2. Enter your email and password
3. Click **"Login"**
4. ✅ Access your dashboard!

### 3. Explore Features

Once logged in, you can:
- 📊 **Dashboard** - View business metrics
- 📦 **Orders** - Manage orders from WhatsApp, Facebook, Instagram, etc.
- 💰 **Financial** - Track transactions
- 📦 **Inventory** - Manage stock
- 📈 **Analytics** - View business insights
- 👥 **Employees** - Manage staff
- 📑 **Reports** - Export data
- ⚙️ **Settings** - Update profile, change password

---

## 🛠️ If You Need to Restart

### Stop Everything

**Windows (PowerShell)**:
```powershell
# Stop all Node processes
Get-Process node | Stop-Process -Force
```

**Mac/Linux**:
```bash
# Stop all Node processes
killall node
```

### Start Backend

```bash
cd backend
npm start
```

Wait for:
```
═══════════════════════════════════════════════════
  🚀 BizTrack API Server
═══════════════════════════════════════════════════
  ✓ Server running on port 5000
  ✓ Database: SQLite (initialized)
═══════════════════════════════════════════════════
```

### Start Frontend

```bash
cd frontend
npm run dev
```

Wait for:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

---

## 🧪 Test the Authentication

### Test 1: Register a New User

**Using the UI**:
1. Go to http://localhost:3000/register
2. Register with test@example.com
3. ✅ Should redirect to dashboard

**Using API (curl)**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "business_name": "Test Business"
  }'
```

### Test 2: Login

**Using the UI**:
1. Logout (if logged in)
2. Go to http://localhost:3000/login
3. Login with test@example.com / password123
4. ✅ Should redirect to dashboard

**Using API (curl)**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test 3: Check Health

```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "success": true,
  "message": "BizTrack API is running",
  "timestamp": "2026-04-30T...",
  "version": "3.0.0"
}
```

---

## 📊 View Your Database

### Using SQLite CLI

```bash
cd backend/data
sqlite3 biztrack.db

# View all users
SELECT * FROM users;

# View specific user
SELECT * FROM users WHERE email = 'test@example.com';

# Exit
.exit
```

### Using DB Browser for SQLite

1. Download from https://sqlitebrowser.org/
2. Open `backend/data/biztrack.db`
3. Browse all tables visually

---

## 🔧 Troubleshooting

### "Cannot connect to backend"

**Check backend is running**:
```bash
curl http://localhost:5000/api/health
```

If not running:
```bash
cd backend
npm start
```

### "Port already in use"

**Change backend port**:
Edit `backend/.env`:
```env
PORT=5001
```

Then update `frontend/.env`:
```env
VITE_API_URL=http://localhost:5001
```

### "Database error"

**Reset database**:
```bash
# Delete database (will be recreated)
rm backend/data/biztrack.db

# Restart backend
cd backend
npm start
```

### "Login not working"

**Check**:
1. Backend is running
2. Frontend .env has correct API URL
3. Browser console for errors
4. Network tab in DevTools

---

## 📚 Documentation

- **PRODUCTION_DEPLOYMENT_GUIDE.md** - Complete deployment guide
- **ORDERS_MANAGEMENT_GUIDE.md** - Orders feature guide
- **WHATS_NEW.md** - Latest features
- **README.md** - Project overview

---

## 🎉 Features Overview

### ✅ Completed Features (15+)

1. **Real Authentication** - JWT-based secure login
2. **User Registration** - Create accounts with validation
3. **Profile Management** - Update business info
4. **Password Management** - Change password securely
5. **Dashboard** - Business metrics and analytics
6. **Orders Management** - Multi-platform order tracking
7. **Sales Tracking** - Record sales with units
8. **Inventory Management** - Stock management with auto-deduction
9. **Expense Tracking** - Monitor business expenses
10. **Profit Analysis** - Revenue vs expenses
11. **Receipt Generation** - Send via WhatsApp/SMS/Email
12. **Report Exports** - CSV and PDF downloads
13. **Search & Filter** - Find transactions quickly
14. **Dark/Light Mode** - Theme switching
15. **Data Persistence** - SQLite database

### 🌟 Platform Integrations

- 📱 WhatsApp Orders
- 📘 Facebook Orders
- 📸 Instagram Orders
- 🎵 TikTok Orders
- ☎️ Phone Orders
- 📧 Email Orders
- 🚶 Walk-in Orders

---

## 🚀 Next Steps

1. ✅ **Create your account** - Register at http://localhost:3000/register
2. ✅ **Add inventory** - Go to Inventory page
3. ✅ **Record sales** - Use Quick Actions on Dashboard
4. ✅ **Track orders** - Add orders from different platforms
5. ✅ **Generate reports** - Export your data
6. ✅ **Customize** - Update your profile and settings

---

## 💡 Pro Tips

### Tip 1: Use WhatsApp Integration
- Most customers in Kenya use WhatsApp
- Add customer phone when recording sales
- Send receipts instantly via WhatsApp

### Tip 2: Track Orders by Platform
- See which platform brings most orders
- Focus marketing on best-performing platforms
- Use filters to view platform-specific orders

### Tip 3: Monitor Inventory
- Set minimum stock levels
- Get low stock warnings
- Auto-deduction on sales

### Tip 4: Regular Backups
```bash
# Backup database
cp backend/data/biztrack.db backend/data/backup-$(date +%Y%m%d).db
```

### Tip 5: Export Reports
- Go to Reports page
- Download CSV or PDF
- Keep records for accounting

---

## 🆘 Need Help?

### Check Logs

**Backend logs**:
- Look at terminal running backend
- Check for error messages

**Frontend logs**:
- Open browser DevTools (F12)
- Check Console tab
- Check Network tab

### Common Issues

**Issue**: Blank page  
**Solution**: Check browser console for errors

**Issue**: Login fails  
**Solution**: Check backend is running, verify credentials

**Issue**: Data not saving  
**Solution**: Check database file exists, check backend logs

---

## 📞 Support

For issues or questions:
1. Check PRODUCTION_DEPLOYMENT_GUIDE.md
2. Check browser console for errors
3. Check backend terminal for logs
4. Verify both servers are running

---

## ✅ Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can register new account
- [ ] Can login successfully
- [ ] Can view dashboard
- [ ] Can add inventory
- [ ] Can record sales
- [ ] Can manage orders
- [ ] Database file created at backend/data/biztrack.db

---

## 🎊 Congratulations!

Your BizTrack application is:
- ✅ Fully functional
- ✅ Production-ready
- ✅ Secure and reliable
- ✅ Professional grade
- ✅ Ready for real business use

**Start managing your business like a pro!** 💼🚀

---

**Version**: 3.0.0  
**Status**: Production Ready ✅  
**Date**: April 30, 2026

**Access Now**: http://localhost:3000
