# Frontend Migration Guide: localStorage → Backend API

**Status**: Backend Complete ✅ | Frontend Migration In Progress ⏳

---

## 📋 Overview

This guide explains how to migrate the frontend from using localStorage to using the backend API.

### What's Been Done
- ✅ Backend API complete with 41 endpoints
- ✅ API utility file created (`frontend/src/utils/api.js`)
- ✅ Backend running on port 5001
- ✅ Frontend configured to use port 5001

### What Needs to Be Done
Update 7 frontend components to use API instead of localStorage

---

## 🔧 API Utility Usage

The `frontend/src/utils/api.js` file provides easy-to-use functions for all API calls:

```javascript
import { inventoryAPI, salesAPI, ordersAPI, transactionsAPI, adminAPI } from '../utils/api';

// Example: Get all inventory items
const items = await inventoryAPI.getAll();

// Example: Create a sale
const sale = await salesAPI.create({
  item_name: 'Tomatoes',
  quantity: 5,
  unit: 'kg',
  unit_price: 80,
  amount: 400,
  customer_phone: '254712345678',
  status: 'completed'
});
```

---

## 📝 Migration Checklist

### 1. Dashboard (`frontend/src/pages/Dashboard.jsx`)

**Current**: Uses localStorage for sales and expenses  
**Target**: Use `salesAPI` and `transactionsAPI`

**Changes Needed**:
```javascript
// OLD: localStorage
const sales = JSON.parse(localStorage.getItem('sales') || '[]');

// NEW: API
import { salesAPI, transactionsAPI } from '../utils/api';
const { data: salesStats } = await salesAPI.getStats();
const { data: transactionsSummary } = await transactionsAPI.getSummary();
```

**Steps**:
1. Import API functions
2. Replace localStorage reads with API calls
3. Add loading states (`useState` for loading)
4. Add error handling (try/catch with toast notifications)
5. Use `useEffect` to fetch data on mount
6. Update Quick Actions to use API for creating sales/expenses

---

### 2. Inventory Page (`frontend/src/pages/Inventory.jsx`)

**Current**: Uses localStorage for inventory items  
**Target**: Use `inventoryAPI`

**Changes Needed**:
```javascript
// OLD: localStorage
const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
localStorage.setItem('inventory', JSON.stringify(updatedInventory));

// NEW: API
import { inventoryAPI } from '../utils/api';

// Fetch items
const { data: items } = await inventoryAPI.getAll();

// Add item
const { data: newItem } = await inventoryAPI.create(itemData);

// Update item
const { data: updated } = await inventoryAPI.update(id, itemData);

// Delete item
await inventoryAPI.delete(id);

// Get low stock
const { data: lowStock } = await inventoryAPI.getLowStock();
```

**Steps**:
1. Import `inventoryAPI`
2. Add state for loading and errors
3. Create `fetchInventory` function
4. Update `handleAddItem` to use `inventoryAPI.create()`
5. Update `handleEditItem` to use `inventoryAPI.update()`
6. Update `handleDeleteItem` to use `inventoryAPI.delete()`
7. Remove all localStorage calls
8. Add error handling with toast notifications

---

### 3. Orders Page (`frontend/src/pages/Orders.jsx`)

**Current**: Uses localStorage for orders  
**Target**: Use `ordersAPI`

**Changes Needed**:
```javascript
// OLD: localStorage
const orders = JSON.parse(localStorage.getItem('orders') || '[]');

// NEW: API
import { ordersAPI } from '../utils/api';

// Fetch orders
const { data: orders } = await ordersAPI.getAll({ platform, status });

// Create order
const { data: newOrder } = await ordersAPI.create(orderData);

// Update order
const { data: updated } = await ordersAPI.update(id, orderData);

// Delete order
await ordersAPI.delete(id);

// Update status
await ordersAPI.updateStatus(id, 'completed');

// Get statistics
const { data: stats } = await ordersAPI.getStats();
```

**Steps**:
1. Import `ordersAPI`
2. Add loading and error states
3. Create `fetchOrders` function
4. Update `handleAddOrder` to use `ordersAPI.create()`
5. Update `handleEditOrder` to use `ordersAPI.update()`
6. Update `handleDeleteOrder` to use `ordersAPI.delete()`
7. Update status changes to use `ordersAPI.updateStatus()`
8. Fetch statistics from `ordersAPI.getStats()`
9. Remove localStorage calls

---

### 4. Financial Transactions (`frontend/src/pages/FinancialTransactions.jsx`)

**Current**: Uses localStorage for transactions  
**Target**: Use `transactionsAPI`

**Changes Needed**:
```javascript
// OLD: localStorage
const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

// NEW: API
import { transactionsAPI } from '../utils/api';

// Fetch transactions with filters
const { data: transactions } = await transactionsAPI.getAll({
  type: 'sale',
  status: 'completed',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  limit: 100,
  offset: 0
});

// Get summary
const { data: summary } = await transactionsAPI.getSummary();

// Get stats by type
const { data: typeStats } = await transactionsAPI.getStatsByType();

// Get stats by category
const { data: categoryStats } = await transactionsAPI.getStatsByCategory();
```

**Steps**:
1. Import `transactionsAPI`
2. Add loading and error states
3. Create `fetchTransactions` function with filters
4. Update filters to trigger API calls
5. Implement pagination
6. Remove localStorage calls

---

### 5. Admin Panel (`frontend/src/pages/AdminPanel.jsx`)

**Current**: Uses demo/mock data  
**Target**: Use `adminAPI`

**Changes Needed**:
```javascript
// OLD: Demo data
const demoUsers = [
  { id: 1, email: 'demo@biztrack.com', ... }
];

// NEW: API
import { adminAPI } from '../utils/api';

// Fetch all users
const { data: users } = await adminAPI.getAllUsers();

// Get platform statistics
const { data: stats } = await adminAPI.getPlatformStats();

// Get recent activity
const { data: activity } = await adminAPI.getRecentActivity(20);

// Delete user
await adminAPI.deleteUser(userId);

// Get user details
const { data: userDetails } = await adminAPI.getUserDetails(userId);
```

**Steps**:
1. Import `adminAPI`
2. Remove all demo data
3. Create `fetchUsers` function
4. Create `fetchPlatformStats` function
5. Create `fetchRecentActivity` function
6. Update `handleDeleteUser` to use `adminAPI.deleteUser()`
7. Update `handleSuspendUser` (note: suspend not implemented in backend, use status field)
8. Add loading and error states

---

### 6. Quick Action Modal (`frontend/src/components/QuickActionModal.jsx`)

**Current**: Uses localStorage for sales and expenses  
**Target**: Use `salesAPI` and `transactionsAPI`

**Changes Needed**:
```javascript
// OLD: localStorage for sales
const sales = JSON.parse(localStorage.getItem('sales') || '[]');
sales.push(newSale);
localStorage.setItem('sales', JSON.stringify(sales));

// NEW: API
import { salesAPI, transactionsAPI } from '../utils/api';

// Create sale
const { data: newSale } = await salesAPI.create({
  item_name: formData.itemName,
  quantity: parseFloat(formData.quantity),
  unit: formData.unit,
  unit_price: parseFloat(formData.price),
  amount: parseFloat(formData.total),
  customer_phone: formData.customerPhone,
  status: formData.paymentStatus === 'completed' ? 'completed' : 'pending'
});

// Create expense
const { data: newExpense } = await transactionsAPI.create({
  type: 'expense',
  amount: parseFloat(formData.amount),
  description: formData.description,
  category: formData.category,
  status: 'completed'
});
```

**Steps**:
1. Import `salesAPI` and `transactionsAPI`
2. Update `handleAddSale` to use `salesAPI.create()`
3. Update `handleAddExpense` to use `transactionsAPI.create()`
4. Add loading state during API calls
5. Show success/error toasts
6. Remove localStorage calls
7. Call parent refresh function after successful creation

---

### 7. Reports Page (`frontend/src/pages/Reports.jsx`)

**Current**: Uses localStorage for data export  
**Target**: Use API to fetch data

**Changes Needed**:
```javascript
// OLD: localStorage
const sales = JSON.parse(localStorage.getItem('sales') || '[]');
const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');

// NEW: API
import { salesAPI, inventoryAPI, transactionsAPI } from '../utils/api';

// Fetch data for reports
const { data: sales } = await salesAPI.getAll();
const { data: inventory } = await inventoryAPI.getAll();
const { data: transactions } = await transactionsAPI.getAll();
```

**Steps**:
1. Import API functions
2. Update data fetching to use API
3. Keep export functionality (CSV/PDF generation)
4. Add date range filters using API
5. Add loading states

---

## 🎯 Implementation Priority

### High Priority (Core Functionality)
1. ✅ **API Utility** - Complete
2. **Dashboard** - Most used page
3. **Inventory** - Critical for business operations
4. **Quick Action Modal** - Used for adding sales/expenses

### Medium Priority (Important Features)
5. **Orders** - Multi-platform tracking
6. **Financial Transactions** - Transaction history

### Low Priority (Admin/Reports)
7. **Admin Panel** - Admin-only features
8. **Reports** - Data export

---

## 🔄 Migration Pattern

For each component, follow this pattern:

### 1. Add Imports
```javascript
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { inventoryAPI } from '../utils/api';
```

### 2. Add State
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

### 3. Create Fetch Function
```javascript
const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await inventoryAPI.getAll();
    setData(response.data);
  } catch (err) {
    setError(err.message);
    toast.error('Failed to fetch data: ' + err.message);
  } finally {
    setLoading(false);
  }
};
```

### 4. Use useEffect
```javascript
useEffect(() => {
  fetchData();
}, []);
```

### 5. Update CRUD Operations
```javascript
const handleCreate = async (newItem) => {
  try {
    const response = await inventoryAPI.create(newItem);
    toast.success('Item added successfully');
    fetchData(); // Refresh data
  } catch (err) {
    toast.error('Failed to add item: ' + err.message);
  }
};

const handleUpdate = async (id, updates) => {
  try {
    await inventoryAPI.update(id, updates);
    toast.success('Item updated successfully');
    fetchData(); // Refresh data
  } catch (err) {
    toast.error('Failed to update item: ' + err.message);
  }
};

const handleDelete = async (id) => {
  try {
    await inventoryAPI.delete(id);
    toast.success('Item deleted successfully');
    fetchData(); // Refresh data
  } catch (err) {
    toast.error('Failed to delete item: ' + err.message);
  }
};
```

### 6. Add Loading UI
```javascript
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}

if (error) {
  return (
    <div className="text-center text-red-500 p-4">
      <p>Error: {error}</p>
      <button onClick={fetchData} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
        Retry
      </button>
    </div>
  );
}
```

---

## ⚠️ Important Notes

### 1. Authentication
- All API calls automatically include the JWT token from localStorage
- If token is invalid/expired, user will get 401 error
- Handle 401 errors by redirecting to login

### 2. Error Handling
- Always wrap API calls in try/catch
- Show user-friendly error messages with toast notifications
- Provide retry options for failed requests

### 3. Loading States
- Show loading spinners during API calls
- Disable buttons during operations to prevent double-clicks
- Provide visual feedback for all actions

### 4. Data Refresh
- After create/update/delete operations, refresh the data
- Consider implementing optimistic updates for better UX
- Use polling or WebSockets for real-time updates (future enhancement)

### 5. Backward Compatibility
- Keep localStorage as fallback during migration
- Test each component thoroughly before removing localStorage
- Consider gradual rollout (feature flags)

---

## 🧪 Testing Checklist

For each migrated component:

- [ ] Data loads correctly on mount
- [ ] Loading state shows during API calls
- [ ] Error states display properly
- [ ] Create operation works and refreshes data
- [ ] Update operation works and refreshes data
- [ ] Delete operation works and refreshes data
- [ ] Filters work correctly (if applicable)
- [ ] Pagination works (if applicable)
- [ ] Toast notifications show for success/error
- [ ] No console errors
- [ ] No localStorage calls remaining
- [ ] Authentication errors handled properly

---

## 📊 Progress Tracking

| Component | Status | Priority | Estimated Time |
|-----------|--------|----------|----------------|
| API Utility | ✅ Complete | High | - |
| Dashboard | ⏳ Pending | High | 2-3 hours |
| Inventory | ⏳ Pending | High | 2-3 hours |
| Quick Actions | ⏳ Pending | High | 1-2 hours |
| Orders | ⏳ Pending | Medium | 2-3 hours |
| Transactions | ⏳ Pending | Medium | 1-2 hours |
| Admin Panel | ⏳ Pending | Low | 2-3 hours |
| Reports | ⏳ Pending | Low | 1-2 hours |

**Total Estimated Time**: 13-20 hours

---

## 🚀 Next Steps

1. Start with **Dashboard** (highest priority)
2. Then **Inventory** (critical functionality)
3. Then **Quick Actions** (most used feature)
4. Continue with medium priority components
5. Finish with low priority components
6. Test entire application end-to-end
7. Remove all localStorage code
8. Update documentation

---

## 💡 Tips

- Test each component individually before moving to the next
- Keep the backend server running during development
- Use browser DevTools Network tab to debug API calls
- Check backend terminal for error logs
- Use Postman/curl to test API endpoints directly if needed
- Commit after each successful component migration

---

**Migration Started**: April 30, 2026  
**Backend Status**: ✅ Complete  
**Frontend Status**: ⏳ In Progress

