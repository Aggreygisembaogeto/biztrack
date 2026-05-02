# 🚀 Getting Started with BizTrack

Welcome to BizTrack - Your complete business management solution for tracking sales, inventory, orders, and finances.

## 📋 Table of Contents
- [System Overview](#system-overview)
- [Quick Start](#quick-start)
- [User Registration](#user-registration)
- [Dashboard Features](#dashboard-features)
- [Admin Access](#admin-access)
- [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

BizTrack consists of three applications:

1. **User Dashboard** (Port 3000) - Main business management interface
2. **Admin Panel** (Port 3001) - System administration (admin only)
3. **Backend API** (Port 5001) - Database and business logic

### Current System Status
✅ Database is clean and ready for new users  
✅ Only admin account exists: `admin@biztrack.com`  
✅ All test data has been removed  

---

## ⚡ Quick Start

### 1. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

### 2. Register Your Business
Click **"Create Account"** on the login page and fill in:
- **Email**: Your business email
- **Password**: Secure password (min 6 characters)
- **Business Name**: Your business/shop name
- **Phone**: Your contact number (optional)
- **Address**: Your business location (optional)

### 3. Start Using BizTrack
After registration, you'll be automatically logged in to your dashboard!

---

## 👤 User Registration

### Registration Process
1. Go to http://localhost:3000
2. Click **"Create Account"**
3. Fill in your business details
4. Click **"Create Account"**
5. You'll be logged in automatically

### What Happens After Registration?
- ✅ Your account is created with role: `user`
- ✅ You get access to all business management features
- ✅ Your data is isolated from other users
- ✅ You can start recording sales, inventory, and orders immediately

### User Roles
- **User** (default): Full access to business management features
- **Admin**: System administration + all user features

---

## 📊 Dashboard Features

### 1. **Dashboard** (Home)
- Today's revenue and transaction stats
- Revenue trends and charts
- Quick actions for common tasks
- Activity feed
- AI Assistant for business insights

### 2. **Daily Tracker**
- Record daily sales quickly
- Track daily expenses
- View daily summaries

### 3. **Orders Management**
- Track orders from multiple platforms:
  - WhatsApp
  - Facebook
  - Instagram
  - TikTok
  - Phone calls
  - Email
  - Walk-in customers
- Update order status
- WhatsApp integration for customer notifications

### 4. **Financial Transactions**
- Record payments received
- Track expenses
- Categorize transactions
- View transaction history
- Generate financial reports

### 5. **Inventory Management**
- Add products/items
- Track stock levels
- Low stock alerts
- Update quantities
- View inventory value

### 6. **Analytics**
- Sales trends
- Revenue analysis
- Top-selling items
- Performance metrics

### 7. **Reports**
- Generate business reports
- Export data (CSV, PDF)
- Custom date ranges
- Financial summaries

### 8. **Settings**
- Update business profile
- Change password
- Configure preferences
- Upload business logo

---

## 🔐 Admin Access

### Admin Login
**Email**: `admin@biztrack.com`  
**Password**: `admin123`

⚠️ **IMPORTANT**: Change the admin password immediately after first login!

### Admin Features
- View all registered users
- Manage user accounts
- System-wide statistics
- Platform analytics
- Access admin panel at http://localhost:3001

### Admin Panel Access
Only users with `role='admin'` can see the "Admin Panel" link in the sidebar.

---

## 🎨 Key Features

### 📱 Multi-Platform Order Tracking
Track orders from:
- Social media (WhatsApp, Facebook, Instagram, TikTok)
- Traditional channels (Phone, Email, Walk-in)

### 💰 Complete Financial Management
- Sales tracking
- Expense management
- Revenue analytics
- Profit calculations

### 📦 Inventory Control
- Real-time stock tracking
- Low stock alerts
- Automatic inventory updates on sales

### 📈 Business Intelligence
- AI-powered insights
- Market advisor
- Cashflow predictions
- Weekly insights

### 🔄 Real-time Updates
- Live dashboard updates
- Instant notifications
- Activity feed

---

## 🛠️ Troubleshooting

### Can't Access the Application?
**Check if servers are running:**
```bash
# Backend should be on port 5001
# Frontend should be on port 3000
# Admin panel should be on port 3001
```

### Login Issues?
1. Make sure you registered an account
2. Check your email and password
3. Try refreshing the page (Ctrl + F5)
4. Clear browser cache

### Data Not Showing?
1. Check your internet connection
2. Refresh the page
3. Check browser console for errors (F12)
4. Make sure backend is running

### Forgot Password?
Contact the system administrator to reset your password using:
```bash
cd backend
node reset-password.js your-email@example.com newpassword
```

---

## 📝 Best Practices

### 1. Regular Data Entry
- Record sales daily
- Update inventory regularly
- Track expenses as they occur

### 2. Use Categories
- Categorize transactions for better reporting
- Use consistent naming for inventory items

### 3. Monitor Alerts
- Check low stock warnings
- Review daily summaries
- Monitor cashflow predictions

### 4. Generate Reports
- Weekly sales reports
- Monthly financial summaries
- Inventory audits

### 5. Backup Data
- Admin should regularly backup the database
- Database location: `backend/data/biztrack.db`

---

## 🔒 Security Notes

### For Users
- Use a strong password
- Don't share your login credentials
- Log out when done

### For Admins
- Change default admin password immediately
- Regularly review user accounts
- Keep the system updated
- Backup database regularly

---

## 📞 Support

### Need Help?
1. Check this guide first
2. Review the error messages
3. Check browser console (F12)
4. Contact system administrator

### Common Questions

**Q: Can I have multiple users for my business?**  
A: Each email creates a separate business account. For team access, share login credentials or contact admin for multi-user setup.

**Q: Is my data private?**  
A: Yes! Each user's data is completely isolated. Only you and admins can see your business data.

**Q: Can I export my data?**  
A: Yes! Use the Reports section to export data in CSV or PDF format.

**Q: What happens if I delete something by mistake?**  
A: Deletions are permanent. Be careful when deleting records. Consider archiving instead.

---

## 🎉 You're Ready!

Your BizTrack system is now clean and ready for use. Start by:

1. ✅ Registering your business account
2. ✅ Adding your first inventory items
3. ✅ Recording your first sale
4. ✅ Exploring the dashboard features

**Happy tracking! 🚀**

---

*Last Updated: System cleaned and ready for production use*
