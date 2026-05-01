# Admin Panel - Complete Guide

## 🛡️ Overview

The Admin Panel provides system-wide monitoring and management capabilities for BizTrack administrators, while allowing them to maintain their own business dashboard.

**Access Level**: Admin Only (Demo: All users)  
**Email**: admin@biztrack.com (Production)  
**URL**: http://localhost:3000/admin

---

## 🔐 Access Control

### Who Can Access?

**Demo Mode (Current)**:
- ✅ All logged-in users can access Admin Panel
- ✅ Perfect for testing and demonstration
- ✅ Easy to switch between business dashboard and admin panel

**Production Mode**:
- Email: `admin@biztrack.com`
- Must be logged in with admin credentials
- Automatic redirect if unauthorized

### How to Access:

1. **Create Admin Account** (Production):
   ```
   Go to: http://localhost:3000/register
   Email: admin@biztrack.com
   Password: (your secure password)
   Business Name: BizTrack Admin
   ```

2. **Login as Admin**:
   ```
   Go to: http://localhost:3000/login
   Email: admin@biztrack.com (or any email in demo mode)
   Password: (your password)
   ```

3. **Access Admin Panel**:
   - Click "Admin Panel" in sidebar (red icon with ADMIN badge)
   - Or go directly to: http://localhost:3000/admin

4. **Access Your Business Dashboard**:
   - Click "Dashboard" in sidebar
   - Or go directly to: http://localhost:3000/dashboard

---

## 🏗️ Two Separate Dashboards

### Your Business Dashboard (/dashboard)
- Manage YOUR sales, inventory, orders
- Track YOUR business performance
- Same features as all other users
- Personal business data only

### Admin Panel (/admin)
- Monitor ALL businesses on the platform
- Manage ALL user accounts
- View platform-wide statistics
- System health monitoring

**Key Point**: Admin has access to BOTH dashboards!

---

## 📊 Admin Panel Features

### 1. Platform Overview Tab

**System Statistics**:
- ✅ Total Users - All registered users
- ✅ Active Users - Currently active accounts
- ✅ Total Revenue - Combined revenue across all businesses
- ✅ Total Orders - All orders from all users
- ✅ Suspended Users - Accounts that are suspended
- ✅ Inventory Items - Total items across all businesses
- ✅ Average Revenue per User - Performance metric

**Recent Activity**:
- View latest user activity
- See last login times
- Monitor user engagement

**Quick Stats**:
- New users today
- Active users today
- System health indicators

---

### 2. User Management Tab

**Features**:
- ✅ View all registered users
- ✅ Search users by email or business name
- ✅ Filter by status (Active/Suspended)
- ✅ View user details
- ✅ Suspend/Activate users
- ✅ Delete users
- ✅ Export user data

**User Table Columns**:
- User (Business name, email)
- Contact (Phone number)
- Status (Active/Suspended)
- Stats (Revenue, orders)
- Joined date
- Actions (View, Suspend/Activate, Delete)

**Actions**:

**View User** 👁️:
- Click eye icon
- View detailed user information
- See user statistics

**Suspend User** ⚠️:
- Click warning icon
- Suspends user account
- User cannot login
- Data preserved

**Activate User** ✅:
- Click checkmark icon
- Reactivates suspended account
- User can login again

**Delete User** 🗑️:
- Click trash icon
- Confirms deletion
- Permanently removes user
- Cannot be undone

**Export Data** 📥:
- Click "Export" button
- Downloads JSON file
- Contains all user data
- For backup/analysis

---

### 3. Analytics Tab

**Revenue Distribution**:
- See top revenue-generating businesses
- Compare performance across users
- Identify high performers

**Top Performers**:
- Ranked by order count
- See most active businesses
- Track engagement metrics

**Platform Analytics**:
- User growth trends
- Revenue trends
- Order volume analysis

---

### 4. Switching Between Dashboards

**From Your Business Dashboard to Admin Panel**:
1. You're on /dashboard (managing your business)
2. Click "Admin Panel" in sidebar (red, with ADMIN badge)
3. Now on /admin (platform management)

**From Admin Panel to Your Business Dashboard**:
1. You're on /admin (platform management)
2. Click "Back to My Dashboard" button (top right)
3. Or click "Dashboard" in sidebar
4. Now on /dashboard (your business)

**System Health** (in Analytics Tab):
- ✅ API Server - Online/Offline
- ✅ Database - Connected/Disconnected
- ✅ Storage - Available/Full

---

## 🎬 How to Use

### Scenario 1: Monitor System Health

1. Login as Super Admin
2. Go to Super Admin dashboard
3. View Overview tab
4. Check statistics:
   - Total users
   - Active users
   - Revenue metrics
5. ✅ System healthy if all numbers look good

---

### Scenario 2: Manage a User

**Suspend a User**:
1. Go to "User Management" tab
2. Find user in table
3. Click warning icon (⚠️)
4. User is suspended
5. ✅ User cannot login

**Reactivate a User**:
1. Filter by "Suspended" status
2. Find suspended user
3. Click checkmark icon (✅)
4. User is reactivated
5. ✅ User can login again

**Delete a User**:
1. Find user in table
2. Click trash icon (🗑️)
3. Confirm deletion
4. User is permanently deleted
5. ✅ User data removed

---

### Scenario 3: Search for a User

1. Go to "User Management" tab
2. Type in search box:
   - Email: "user@example.com"
   - Business name: "My Shop"
3. Results filter automatically
4. ✅ Find user quickly

---

### Scenario 4: Export User Data

1. Go to "User Management" tab
2. Click "Export" button
3. JSON file downloads
4. Contains all user data
5. ✅ Use for backup or analysis

---

### Scenario 5: View Analytics

1. Go to "Analytics" tab
2. See revenue distribution
3. View top performers
4. Identify trends
5. ✅ Make data-driven decisions

---

## 📊 Statistics Explained

### Total Users
- Count of all registered accounts
- Includes active and suspended
- Excludes deleted users

### Active Users
- Users with "active" status
- Can login and use system
- Not suspended or deleted

### Total Revenue
- Sum of all sales across all users
- Combined business revenue
- Platform-wide metric

### Total Orders
- Count of all orders from all users
- Across all platforms (WhatsApp, Facebook, etc.)
- Platform-wide metric

### New Users Today
- Users registered today
- Growth indicator
- Onboarding metric

### Active Today
- Users who logged in today
- Engagement metric
- Daily active users (DAU)

### Average Revenue per User
- Total Revenue ÷ Total Users
- Performance benchmark
- User value metric

---

## 🔧 User Actions

### View User Details
**What it does**:
- Shows detailed user information
- Displays user statistics
- Shows activity history

**When to use**:
- Investigating user issues
- Checking user performance
- Verifying user data

---

### Suspend User
**What it does**:
- Disables user account
- Prevents login
- Preserves all data

**When to use**:
- Policy violations
- Payment issues
- Temporary restrictions
- Investigation pending

**Effect**:
- ❌ User cannot login
- ✅ Data preserved
- ✅ Can be reactivated

---

### Activate User
**What it does**:
- Enables suspended account
- Allows login
- Restores full access

**When to use**:
- Issue resolved
- Payment received
- Investigation complete
- Reinstatement approved

**Effect**:
- ✅ User can login
- ✅ Full access restored
- ✅ All data intact

---

### Delete User
**What it does**:
- Permanently removes user
- Deletes all user data
- Cannot be undone

**When to use**:
- User requested deletion
- Account closure
- Fraud/abuse
- GDPR compliance

**Effect**:
- ❌ User permanently deleted
- ❌ All data removed
- ❌ Cannot be recovered

**⚠️ Warning**: This action is permanent!

---

## 🎨 UI Features

### Color Coding

**Super Admin Menu**:
- 🔴 Red gradient when active
- 🔴 Red text when inactive
- 🏷️ "ADMIN" badge

**User Status**:
- 🟢 Green = Active
- 🟡 Yellow = Suspended

**Action Buttons**:
- 🔵 Blue = View
- 🟡 Yellow = Suspend
- 🟢 Green = Activate
- 🔴 Red = Delete

### Responsive Design
- ✅ Works on desktop
- ✅ Works on tablet
- ✅ Works on mobile
- ✅ Touch-friendly

### Real-time Updates
- ✅ Instant statistics
- ✅ Live user count
- ✅ Immediate action feedback

---

## 🔒 Security Features

### Access Control
- ✅ Email-based verification
- ✅ Automatic redirect if unauthorized
- ✅ Protected routes
- ✅ Session validation

### Audit Trail
- ✅ Action logging
- ✅ User activity tracking
- ✅ Change history
- ✅ Toast notifications

### Data Protection
- ✅ Secure data storage
- ✅ Encrypted passwords
- ✅ Safe deletion
- ✅ Backup capability

---

## 💡 Best Practices

### 1. Regular Monitoring
- Check dashboard daily
- Monitor user growth
- Track revenue trends
- Watch for anomalies

### 2. User Management
- Review suspended users weekly
- Clean up inactive accounts
- Respond to issues promptly
- Maintain user satisfaction

### 3. Data Backup
- Export user data regularly
- Keep backup copies
- Test restore process
- Document procedures

### 4. Security
- Use strong admin password
- Don't share admin credentials
- Log out when done
- Monitor suspicious activity

### 5. Communication
- Notify users before suspension
- Explain reasons clearly
- Provide appeal process
- Document decisions

---

## 🐛 Troubleshooting

### Cannot Access Admin Panel

**Issue**: "Access denied" message  
**Solution**:
1. In demo mode, any logged-in user should have access
2. Check you're logged in
3. Logout and login again
4. Clear browser cache
5. In production, check you're using admin@biztrack.com

---

### Users Not Showing

**Issue**: User table is empty  
**Solution**:
1. Check localStorage for user data
2. Refresh the page
3. Check browser console for errors
4. Verify users are registered

---

### Actions Not Working

**Issue**: Suspend/Delete buttons don't work  
**Solution**:
1. Check browser console for errors
2. Refresh the page
3. Try different browser
4. Clear browser cache

---

### Export Not Downloading

**Issue**: Export button doesn't download file  
**Solution**:
1. Check browser download settings
2. Allow pop-ups for the site
3. Try different browser
4. Check disk space

---

## 📊 Sample Data

The Super Admin dashboard includes sample users for testing:

**User 1**:
- Email: demo@biztrack.com
- Business: Demo Restaurant
- Status: Active
- Revenue: KES 150,000
- Orders: 250

**User 2**:
- Email: shop@example.com
- Business: Corner Shop
- Status: Active
- Revenue: KES 85,000
- Orders: 180

**User 3**:
- Email: market@example.com
- Business: Fresh Market
- Status: Suspended
- Revenue: KES 45,000
- Orders: 95

---

## 🎯 Quick Reference

### Keyboard Shortcuts
- None currently (future feature)

### Common Tasks

**Switch to Admin Panel**: Click "Admin Panel" in sidebar  
**Switch to Your Dashboard**: Click "Dashboard" in sidebar or "Back to My Dashboard" button  
**View all users**: User Management tab  
**Search user**: Type in search box  
**Suspend user**: Click ⚠️ icon  
**Activate user**: Click ✅ icon  
**Delete user**: Click 🗑️ icon  
**Export data**: Click Export button  
**View stats**: Platform Overview tab  
**Check health**: Analytics tab  

---

## 🔮 Future Enhancements

Planned features:
1. **Advanced Analytics** - Charts and graphs
2. **Email Notifications** - Alert admins of issues
3. **Bulk Actions** - Manage multiple users at once
4. **Activity Logs** - Detailed audit trail
5. **User Roles** - Multiple admin levels
6. **API Access** - Programmatic management
7. **Reports** - Automated reports
8. **Alerts** - System health alerts

---

## ✅ Success Checklist

- [ ] Created account and logged in
- [ ] Accessed your business dashboard (/dashboard)
- [ ] Added a sale to YOUR business
- [ ] Clicked "Admin Panel" in sidebar
- [ ] Accessed Admin Panel (/admin)
- [ ] Viewed platform statistics
- [ ] Searched for a user
- [ ] Viewed user details
- [ ] Suspended a user
- [ ] Reactivated a user
- [ ] Exported user data
- [ ] Checked system health
- [ ] Clicked "Back to My Dashboard"
- [ ] Returned to your business dashboard

---

## 🆘 Support

For Super Admin issues:
1. Check this guide
2. Review browser console
3. Check backend logs
4. Verify admin credentials
5. Test with different browser

---

**Version**: 3.0.0  
**Status**: ✅ Production Ready  
**Access**: All users (demo mode) / Admin only (production)  
**URLs**: 
- Your Business: http://localhost:3000/dashboard
- Admin Panel: http://localhost:3000/admin

**Manage your business AND the platform!** 🛡️💼
