# 🔐 Super Admin & Commission System Setup

## Overview

BizTrack now has a two-tier user system:
1. **Super Admin** - Platform owner who manages everything and collects commissions
2. **Business Owners** - Users who run their businesses and pay commissions

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Migration
```bash
cd backend
node migrations/add-super-admin-and-commission.js
```

### Step 2: Create Super Admin
```bash
node create-super-admin.js
```

### Step 3: Restart Backend
```bash
npm start
```

---

## 👥 User Roles Explained

### Super Admin (Platform Owner)
**Role:** `super_admin`

**Capabilities:**
- ✅ Manage all users
- ✅ View all transactions across all businesses
- ✅ Collect commissions from all transactions
- ✅ Manage subscription plans
- ✅ Configure platform settings
- ✅ Delete users
- ✅ Change user subscription plans
- ✅ View platform-wide statistics
- ✅ Mark commissions as paid
- ✅ Full system access

**Commission:** 0% (doesn't pay commission)

**Access:** Special super admin dashboard

---

### Business Owners (Regular Users)
**Role:** `user`

**Capabilities:**
- ✅ Manage their own business
- ✅ Record sales and expenses
- ✅ Manage inventory
- ✅ View their own reports
- ✅ Manage their team
- ❌ Cannot see other businesses
- ❌ Cannot access super admin features

**Commission:** Pays commission based on subscription plan

**Access:** Regular business dashboard

---

## 💰 Commission System

### How It Works:

1. **Business owner records a sale/payment**
   - Amount: KES 1,000

2. **System calculates commission**
   - Free plan: 5% = KES 50
   - Basic plan: 3% = KES 30
   - Pro plan: 2% = KES 20
   - Enterprise: 1% = KES 10

3. **Commission is recorded**
   - Status: Pending
   - Visible to super admin

4. **Super admin marks as paid**
   - Status: Paid
   - Paid date recorded

### Subscription Plans:

| Plan | Price/Month | Commission | Transactions | Users |
|------|-------------|------------|--------------|-------|
| **Free** | KES 0 | 5% | 100/month | 1 |
| **Basic** | KES 999 | 3% | 1,000/month | 3 |
| **Pro** | KES 2,999 | 2% | Unlimited | 10 |
| **Enterprise** | KES 9,999 | 1% | Unlimited | Unlimited |

---

## 🎯 Super Admin Dashboard Features

### 1. Platform Statistics
- Total users
- Total transactions
- Total revenue (all businesses)
- Total commissions earned
- Pending commissions
- Recent signups

### 2. User Management
- View all users
- See each user's:
  - Email & business name
  - Subscription plan
  - Total transactions
  - Total revenue
  - Commission rate
- Delete users
- Change subscription plans

### 3. Commission Management
- View all commissions
- Filter by status (pending/paid)
- Mark commissions as paid
- Export commission reports

### 4. Subscription Plans
- View all plans
- See plan details
- Monitor plan distribution

### 5. Platform Settings
- Configure default commission rate
- Enable/disable user registration
- Require approval for new users
- Platform branding

---

## 📊 Database Schema

### New Tables:

**commissions:**
```sql
- id
- user_id (who owes the commission)
- transaction_id (which transaction)
- amount (transaction amount)
- commission_amount (calculated commission)
- commission_rate (rate used)
- status (pending/paid)
- created_at
- paid_at
```

**subscription_plans:**
```sql
- id
- name (free/basic/pro/enterprise)
- price
- commission_rate
- features (JSON)
- max_transactions
- max_users
```

**platform_settings:**
```sql
- id
- setting_key
- setting_value
- updated_at
```

### Updated Tables:

**users:** (new columns)
```sql
- subscription_plan (free/basic/pro/enterprise)
- subscription_status (active/inactive/suspended)
- commission_rate (percentage)
```

---

## 🔧 Setup Instructions

### 1. Run Migration

```bash
cd backend
node migrations/add-super-admin-and-commission.js
```

**What it does:**
- Adds commission columns to users table
- Creates commissions table
- Creates subscription_plans table
- Creates platform_settings table
- Inserts default subscription plans
- Sets up default settings

### 2. Create Super Admin

```bash
node create-super-admin.js
```

**You'll be prompted for:**
- Email address
- Password (min 6 characters)
- Platform name (default: BizTrack Platform)

**Example:**
```
Enter super admin email: admin@biztrack.com
Enter password: SuperSecure123
Enter platform name: BizTrack Platform
```

### 3. Verify Super Admin

```bash
node check-users.js
```

**You should see:**
```
- ID: X, Email: admin@biztrack.com, Business: BizTrack Platform, Role: super_admin
```

### 4. Restart Backend

```bash
npm start
```

---

## 🎨 Frontend Integration

### Super Admin Routes:

**New API endpoints:**
```
GET    /api/super-admin/users
GET    /api/super-admin/stats
GET    /api/super-admin/commissions
PUT    /api/super-admin/commissions/:id/mark-paid
GET    /api/super-admin/subscription-plans
PUT    /api/super-admin/users/:id/subscription
DELETE /api/super-admin/users/:id
GET    /api/super-admin/settings
PUT    /api/super-admin/settings
```

### Access Control:

**Sidebar logic:**
```javascript
// Show different menu based on role
if (user.role === 'super_admin') {
  // Show super admin dashboard
  // Hide regular business features
} else {
  // Show regular business dashboard
  // Hide super admin features
}
```

---

## 💡 Usage Examples

### For Super Admin:

**Login:**
```
Email: admin@biztrack.com
Password: [your password]
```

**View all users:**
- Go to Super Admin Dashboard
- See list of all businesses
- View their statistics

**Collect commissions:**
- View commissions tab
- See pending commissions
- Mark as paid when received

**Manage subscriptions:**
- Click on a user
- Change their plan
- Update commission rate

---

### For Business Owners:

**Register:**
- Sign up normally
- Automatically assigned "Free" plan
- 5% commission rate

**Record transactions:**
- Sales and payments automatically calculate commission
- Commission is transparent
- Visible in transaction details

**Upgrade plan:**
- Contact super admin
- Super admin changes plan
- Lower commission rate applied

---

## 🔒 Security

### Super Admin Protection:
- ✅ Cannot be deleted
- ✅ Separate middleware check
- ✅ All routes protected
- ✅ Role verified on every request

### Business Owner Protection:
- ✅ Can only see their own data
- ✅ Cannot access other businesses
- ✅ Cannot see super admin features
- ✅ Commission calculated automatically

---

## 📈 Commission Calculation

### Automatic Calculation:

When a business owner records a transaction:

```javascript
// Example: KES 1,000 sale on Free plan (5%)
Transaction Amount: 1,000
Commission Rate: 5%
Commission Amount: 50

// Recorded in commissions table:
{
  user_id: 123,
  transaction_id: 456,
  amount: 1000,
  commission_amount: 50,
  commission_rate: 5.0,
  status: 'pending'
}
```

### Commission Types:

**Commissionable transactions:**
- ✅ Sales
- ✅ Payments received
- ✅ M-Pesa payments

**Non-commissionable:**
- ❌ Expenses
- ❌ Internal transfers
- ❌ Refunds

---

## 🎯 Business Model

### Revenue Streams:

1. **Subscription Fees:**
   - Basic: KES 999/month
   - Pro: KES 2,999/month
   - Enterprise: KES 9,999/month

2. **Transaction Commissions:**
   - Free users: 5% of all transactions
   - Basic users: 3% of all transactions
   - Pro users: 2% of all transactions
   - Enterprise: 1% of all transactions

### Example Monthly Revenue:

**10 users on Free plan:**
- Each does KES 50,000/month
- Commission: 5% × 50,000 × 10 = KES 25,000

**5 users on Basic plan:**
- Subscription: 999 × 5 = KES 4,995
- Each does KES 100,000/month
- Commission: 3% × 100,000 × 5 = KES 15,000
- Total: KES 19,995

**Total Monthly Revenue: KES 44,995**

---

## ✅ Checklist

### Setup:
- [ ] Run migration script
- [ ] Create super admin account
- [ ] Verify super admin in database
- [ ] Restart backend
- [ ] Test super admin login

### Testing:
- [ ] Login as super admin
- [ ] View platform statistics
- [ ] See all users
- [ ] View commissions
- [ ] Test user management

### Production:
- [ ] Set strong super admin password
- [ ] Configure commission rates
- [ ] Set up subscription plans
- [ ] Enable/disable features
- [ ] Monitor commissions

---

## 🆘 Troubleshooting

### Issue: Migration fails

**Solution:**
```bash
# Check if tables exist
sqlite3 backend/data/biztrack.db ".tables"

# If commissions table exists, migration already ran
# If not, check error message
```

### Issue: Can't create super admin

**Solution:**
```bash
# Check if super admin already exists
node check-users.js

# If exists, remove first
node remove-super-admin.js

# Then create new one
node create-super-admin.js
```

### Issue: Super admin can't access features

**Solution:**
1. Check role in database: `node check-users.js`
2. Should show `Role: super_admin`
3. Logout and login again
4. Check backend logs for errors

---

## 📞 Support

### Commands:

**Check users:**
```bash
node check-users.js
```

**Create super admin:**
```bash
node create-super-admin.js
```

**Make user admin:**
```bash
node make-admin.js email@example.com
```

---

**Status:** Ready to implement  
**Next:** Run migration and create super admin
