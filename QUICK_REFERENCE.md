# 🚀 BizTrack Quick Reference

## 📍 URLs

| Page | URL | Description |
|------|-----|-------------|
| **Login** | http://localhost:3000/login | User login |
| **Register** | http://localhost:3000/register | Create account |
| **Dashboard** | http://localhost:3000/dashboard | Your business dashboard |
| **Admin Panel** | http://localhost:3000/admin | Platform management |
| **Orders** | http://localhost:3000/orders | Orders management |
| **Inventory** | http://localhost:3000/inventory | Inventory management |
| **Reports** | http://localhost:3000/reports | Generate reports |
| **Settings** | http://localhost:3000/settings | App settings |
| **API** | http://localhost:5000/api | Backend API |
| **Health** | http://localhost:5000/api/health | API health check |

---

## 🎯 Quick Actions

### For Regular Users

**Record a Sale**:
1. Dashboard → "Add Sale" button
2. Fill form (item, quantity, unit, price, payment status)
3. Submit
4. If paid → Send receipt (WhatsApp/SMS/Email)

**Add Inventory**:
1. Inventory page → "Add Item" button
2. Fill form (name, quantity, unit, price, min stock)
3. Submit

**Create Order**:
1. Orders page → "Add Order" button
2. Fill form (customer, platform, items)
3. Submit
4. Optional: Send WhatsApp notification

**Generate Report**:
1. Reports page
2. Select report type (Sales/Inventory/Transactions)
3. Click "Download CSV" or "Download PDF"

---

### For Admins

**Access Admin Panel**:
- Click "Admin Panel" in sidebar (red, with ADMIN badge)
- Or go to: http://localhost:3000/admin

**View Platform Stats**:
- Admin Panel → "Platform Overview" tab

**Manage Users**:
- Admin Panel → "User Management" tab
- Search, filter, suspend, activate, delete

**View Analytics**:
- Admin Panel → "Analytics" tab

**Switch to Business Dashboard**:
- Click "Back to My Dashboard" button
- Or click "Dashboard" in sidebar

---

## 🔑 Keyboard Shortcuts

Currently none implemented. Future feature.

---

## 📊 Admin Panel Tabs

| Tab | Purpose | Key Features |
|-----|---------|--------------|
| **Platform Overview** | System statistics | Total users, revenue, orders, activity |
| **User Management** | Manage businesses | Search, filter, suspend, activate, delete |
| **Analytics** | Performance insights | Top performers, system health |

---

## 🎨 Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| **Active** | 🟢 Green | User can login |
| **Suspended** | 🟡 Yellow | User cannot login |
| **Paid** | 🟢 Green | Payment completed |
| **Pending** | 🟡 Yellow | Payment not completed |
| **Delivered** | 🟢 Green | Order delivered |
| **Cancelled** | 🔴 Red | Order cancelled |

---

## 🔧 Common Tasks

### Change Theme
Settings → Toggle "Dark Mode" / "Light Mode"

### Upload Logo
Settings → "Upload Logo" → Select image

### Backup Data
Settings → "Export Data" → JSON downloads

### Restore Data
Settings → "Import Data" → Select JSON file

### Export Users (Admin)
Admin Panel → User Management → "Export" button

---

## 🐛 Troubleshooting

### Cannot Login
- Check email and password
- Ensure account is registered
- Check backend is running (port 5000)
- Clear browser cache

### Cannot Access Admin Panel
- Check you're logged in
- In demo mode, all users have access
- In production, only admin@biztrack.com
- Clear browser cache

### Inventory Not Updating
- Check item name matches exactly
- Ensure item exists in inventory
- Check browser console for errors
- Refresh page

### Receipt Not Sending
- Check payment status is "Paid (Completed)"
- For WhatsApp: Ensure WhatsApp is installed
- For SMS: Requires API integration
- For Email: Ensure email client is configured

---

## 📱 Supported Units

| Unit | Description | Example Use |
|------|-------------|-------------|
| **kg** | Kilograms | Rice, flour, sugar |
| **liters** | Liters | Oil, milk, water |
| **bags** | Bags | Cement, fertilizer |
| **pieces** | Individual items | Phones, chairs |
| **boxes** | Boxes | Cartons, packages |
| **crates** | Crates | Bottles, eggs |
| **units** | Generic units | Any item |
| **grams** | Grams | Spices, tea |
| **ml** | Milliliters | Medicine, perfume |
| **dozen** | Dozen (12) | Eggs, donuts |

---

## 🌐 Supported Order Platforms

| Platform | Icon | Use Case |
|----------|------|----------|
| **WhatsApp** | 💬 | Direct messaging orders |
| **Facebook** | 📘 | Social media orders |
| **Instagram** | 📸 | Visual platform orders |
| **TikTok** | 🎵 | Trending platform orders |
| **Phone** | ☎️ | Traditional call orders |
| **Email** | 📧 | Business email orders |
| **Walk-in** | 🚶 | In-store customers |

---

## 📈 Order Statuses

| Status | Description | Next Action |
|--------|-------------|-------------|
| **Pending** | Order received | Confirm order |
| **Confirmed** | Order confirmed | Start preparing |
| **Preparing** | Being prepared | Mark as ready |
| **Ready** | Ready for pickup/delivery | Deliver order |
| **Delivered** | Order completed | Archive |
| **Cancelled** | Order cancelled | Archive |

---

## 🔐 Security

### Passwords
- Minimum 6 characters
- Hashed with bcrypt
- Never stored in plain text

### Tokens
- JWT authentication
- 30-day expiry
- Stored in localStorage

### API
- Protected endpoints
- CORS configured
- Input validation

---

## 💾 Data Storage

### Frontend (localStorage)
- Sales transactions
- Inventory items
- Expenses
- Settings
- Theme preference
- Business logo

### Backend (SQLite)
- User accounts
- Authentication tokens
- Business profiles
- Transaction history
- Order records

---

## 🚀 Startup Commands

### Development

**Terminal 1 - Backend**:
```bash
cd backend
node server-production.js
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

### Production

**Backend**:
```bash
cd backend
NODE_ENV=production node server-production.js
```

**Frontend**:
```bash
cd frontend
npm run build
# Deploy dist folder
```

---

## 📞 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | /api/auth/register | Register new user |
| **POST** | /api/auth/login | Login user |
| **GET** | /api/auth/me | Get current user |
| **PUT** | /api/auth/profile | Update profile |
| **PUT** | /api/auth/password | Change password |
| **GET** | /api/health | Health check |

---

## 🎯 Default Credentials

### Demo Mode
- Any email and password works
- Create account at /register
- Login at /login

### Production Mode
- Admin: admin@biztrack.com
- Password: (set during registration)

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | Main documentation |
| **QUICK_START.md** | Getting started guide |
| **ADMIN_PANEL_GUIDE.md** | Admin panel complete guide |
| **ORDERS_MANAGEMENT_GUIDE.md** | Orders feature guide |
| **IMPLEMENTATION_COMPLETE.md** | Full implementation summary |
| **TASK_COMPLETE_SUMMARY.md** | Task completion details |
| **QUICK_REFERENCE.md** | This file |

---

## 🔄 Common Workflows

### Daily Business Operations
1. Login → Dashboard
2. Check daily summary
3. Record sales
4. Send receipts
5. Check inventory
6. Manage orders
7. Review activity feed

### Weekly Admin Tasks
1. Login → Admin Panel
2. Check platform statistics
3. Review new users
4. Monitor top performers
5. Check system health
6. Export data backup

### Monthly Reporting
1. Dashboard → Reports
2. Generate sales report (CSV/PDF)
3. Generate inventory report
4. Review profit margins
5. Analyze trends
6. Plan for next month

---

## ⚡ Performance Tips

### Frontend
- Clear localStorage periodically
- Export and backup data regularly
- Use search/filter for large datasets
- Close unused tabs

### Backend
- Monitor database size
- Backup database regularly
- Check error logs
- Monitor API response times

---

## 🎨 UI Tips

### Dark Mode
- Better for low-light environments
- Reduces eye strain
- Saves battery on OLED screens

### Light Mode
- Better for bright environments
- Easier to read in sunlight
- Professional appearance

### Mobile
- Use mobile drawer menu
- Touch-friendly buttons
- Responsive tables
- Swipe gestures

---

## 🆘 Emergency Contacts

### Technical Issues
1. Check documentation
2. Review browser console
3. Check backend logs
4. Clear cache and retry
5. Contact support

### Data Loss
1. Check localStorage
2. Check database file
3. Restore from backup
4. Contact support

---

## ✅ Daily Checklist

### For Business Owners
- [ ] Check daily summary
- [ ] Record all sales
- [ ] Update inventory
- [ ] Process orders
- [ ] Send receipts
- [ ] Review activity feed
- [ ] Check low stock alerts

### For Admins
- [ ] Check platform statistics
- [ ] Review new users
- [ ] Monitor system health
- [ ] Address user issues
- [ ] Review top performers
- [ ] Export data backup

---

## 🎉 Quick Tips

💡 **Tip 1**: Use search to find transactions quickly  
💡 **Tip 2**: Set minimum stock levels to get low stock alerts  
💡 **Tip 3**: Export data regularly for backup  
💡 **Tip 4**: Use WhatsApp for instant receipt delivery  
💡 **Tip 5**: Check daily summary every morning  
💡 **Tip 6**: Upload your logo for professional receipts  
💡 **Tip 7**: Use filters to analyze specific time periods  
💡 **Tip 8**: Switch to light mode for outdoor use  
💡 **Tip 9**: Install as PWA for app-like experience  
💡 **Tip 10**: Admin: Check platform stats daily  

---

**Version**: 3.0.0  
**Last Updated**: April 30, 2026  
**Status**: ✅ Production Ready

**Need help? Check the full documentation guides!** 📚
