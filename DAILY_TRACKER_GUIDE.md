# 📅 Daily Tracker - Complete Guide

## 🎯 Overview

The Daily Tracker is a powerful feature that helps you monitor your business performance by tracking sales, expenses, and profit on a daily, weekly, or monthly basis.

**Access**: Click "Daily Tracker" in the sidebar (calendar icon)

---

## ✨ Features

### 1. Multiple View Modes
- **Day View**: Track performance for a specific day
- **Week View**: See weekly trends (Sunday to Saturday)
- **Month View**: Monitor monthly performance

### 2. Real-time Calculations
- **Total Sales**: Sum of all sales for the period
- **Total Expenses**: Sum of all expenses for the period
- **Net Profit**: Sales minus expenses
- **Profit Margin**: Percentage of profit relative to sales

### 3. Transaction Lists
- **Sales List**: All sales with item names, quantities, and amounts
- **Expenses List**: All expenses with descriptions and categories
- **Time Stamps**: See exactly when each transaction occurred

### 4. Navigation
- **Previous/Next**: Navigate between days, weeks, or months
- **Today Button**: Jump back to current date
- **Date Display**: See the current period being viewed

### 5. Export Data
- Export all data for the selected period as JSON
- Includes summary and detailed transactions

---

## 🎨 Visual Design

### Summary Cards

**Total Sales** (Green):
- Shows total revenue
- Number of sales transactions
- Green gradient background

**Total Expenses** (Red):
- Shows total costs
- Number of expense transactions
- Red gradient background

**Net Profit** (Blue/Orange):
- Blue if profit, orange if loss
- Shows profit or loss amount
- Trending up/down icon

**Profit Margin** (Purple):
- Percentage calculation
- Shows "Healthy", "Negative", or "Break-even"
- Purple gradient background

---

## 🚀 How to Use

### View Today's Performance

1. Click **"Daily Tracker"** in sidebar
2. Automatically shows today's data
3. See sales, expenses, and profit at a glance

### View Different Periods

**Day View**:
```
1. Click "Day" button
2. Use arrows to navigate days
3. Or click "Today" to return
```

**Week View**:
```
1. Click "Week" button
2. See Sunday to Saturday data
3. Use arrows to navigate weeks
```

**Month View**:
```
1. Click "Month" button
2. See entire month data
3. Use arrows to navigate months
```

### Export Data

1. Select the period you want to export
2. Click the download icon (📥)
3. JSON file downloads with all data
4. Use for backup or analysis

---

## 📊 Understanding the Metrics

### Total Sales
- Sum of all sales amounts
- Includes all completed sales
- Shows number of transactions

**Example**:
```
Total Sales: KES 15,000
12 transactions
```

### Total Expenses
- Sum of all expense amounts
- Includes all categories
- Shows number of transactions

**Example**:
```
Total Expenses: KES 8,000
5 transactions
```

### Net Profit
- Formula: Total Sales - Total Expenses
- Positive = Profit (blue)
- Negative = Loss (orange)

**Example**:
```
Net Profit: KES 7,000 (Profit)
or
Net Profit: -KES 2,000 (Loss)
```

### Profit Margin
- Formula: (Net Profit / Total Sales) × 100
- Shows percentage
- Indicates business health

**Example**:
```
Profit Margin: 46.7% (Healthy)
```

---

## 📈 Use Cases

### 1. Daily Performance Check
**Scenario**: Check how today is going

```
1. Open Daily Tracker
2. See today's sales and expenses
3. Monitor profit in real-time
4. Make decisions based on data
```

### 2. Weekly Review
**Scenario**: Review last week's performance

```
1. Click "Week" button
2. Navigate to last week
3. See total sales and expenses
4. Compare to previous weeks
```

### 3. Monthly Analysis
**Scenario**: Analyze monthly trends

```
1. Click "Month" button
2. View entire month data
3. Calculate monthly profit
4. Plan for next month
```

### 4. Compare Periods
**Scenario**: Compare this week to last week

```
1. View this week's data
2. Note the totals
3. Navigate to last week
4. Compare the numbers
```

---

## 🎯 Transaction Details

### Sales List
Each sale shows:
- **Item Name**: What was sold
- **Time**: When it was sold
- **Quantity & Unit**: How much (e.g., 5 kg)
- **Amount**: Total sale price
- **Unit Price**: Price per unit

**Example**:
```
Rice (50kg)
10:30 AM • 2 bags
KES 10,000
@KES 5,000
```

### Expenses List
Each expense shows:
- **Description**: What the expense was for
- **Time**: When it occurred
- **Category**: Type of expense (if set)
- **Amount**: Cost

**Example**:
```
Electricity Bill
2:15 PM • Utilities
KES 3,500
```

---

## 📊 Summary Footer

Shows averages and totals:

**Average Sale**:
- Total Sales ÷ Number of Sales
- Shows typical sale amount

**Average Expense**:
- Total Expenses ÷ Number of Expenses
- Shows typical expense amount

**Total Transactions**:
- Sales + Expenses
- Shows business activity level

---

## 💡 Tips & Best Practices

### 1. Check Daily
- Review tracker every morning
- Monitor progress throughout day
- Adjust strategy based on data

### 2. Use Week View for Planning
- See weekly patterns
- Identify best/worst days
- Plan inventory accordingly

### 3. Monthly Review
- End of month analysis
- Calculate monthly profit
- Set goals for next month

### 4. Export Regularly
- Backup your data weekly
- Keep records for accounting
- Analyze trends over time

### 5. Monitor Profit Margin
- Aim for healthy margin (>30%)
- If negative, reduce expenses
- If low, increase prices or sales

---

## 🎨 Color Coding

| Color | Meaning | Used For |
|-------|---------|----------|
| 🟢 Green | Positive/Income | Sales, profit |
| 🔴 Red | Negative/Cost | Expenses |
| 🔵 Blue | Profit | Positive net profit |
| 🟠 Orange | Loss | Negative net profit |
| 🟣 Purple | Metric | Profit margin |

---

## 📱 Responsive Design

### Desktop
- Full layout with all cards
- Side-by-side transaction lists
- Large date navigation

### Mobile
- Stacked cards
- Scrollable transaction lists
- Compact date navigation
- Touch-friendly buttons

---

## 🔄 Data Updates

### Real-time Sync
- Data updates automatically
- Add sale → Tracker updates
- Add expense → Tracker updates
- No manual refresh needed

### Data Source
- Sales from Sales Storage
- Expenses from Expenses Storage
- Calculations done in real-time

---

## 📥 Export Format

Exported JSON includes:

```json
{
  "period": "Thursday, April 30, 2026",
  "viewMode": "day",
  "summary": {
    "totalSales": 15000,
    "totalExpenses": 8000,
    "netProfit": 7000,
    "profitMargin": "46.7%"
  },
  "sales": [...],
  "expenses": [...]
}
```

---

## 🎯 Quick Actions

| Action | How To |
|--------|--------|
| **View Today** | Click "Today" button |
| **Previous Day** | Click left arrow |
| **Next Day** | Click right arrow |
| **Switch to Week** | Click "Week" button |
| **Switch to Month** | Click "Month" button |
| **Export Data** | Click download icon |

---

## ✅ Success Indicators

**Healthy Business**:
- ✅ Positive net profit
- ✅ Profit margin > 30%
- ✅ Sales > Expenses
- ✅ Consistent daily sales

**Needs Attention**:
- ⚠️ Negative net profit
- ⚠️ Low profit margin (<10%)
- ⚠️ Expenses > Sales
- ⚠️ Declining sales trend

---

## 🎉 Benefits

### For Business Owners
- ✅ Track daily performance
- ✅ Monitor profit in real-time
- ✅ Identify trends quickly
- ✅ Make data-driven decisions

### For Accounting
- ✅ Daily financial records
- ✅ Export for bookkeeping
- ✅ Accurate profit calculation
- ✅ Easy period comparison

### For Planning
- ✅ See what works
- ✅ Identify best days
- ✅ Plan inventory
- ✅ Set realistic goals

---

## 🚀 Getting Started

1. **Open Daily Tracker**
   - Click "Daily Tracker" in sidebar

2. **View Today's Data**
   - See current sales and expenses
   - Check profit status

3. **Explore Different Views**
   - Try day, week, and month views
   - Navigate between periods

4. **Monitor Regularly**
   - Check daily for best results
   - Use data to improve business

---

## 📊 Example Scenarios

### Scenario 1: Good Day
```
Total Sales: KES 25,000 (15 transactions)
Total Expenses: KES 10,000 (3 transactions)
Net Profit: KES 15,000 (Profit)
Profit Margin: 60% (Healthy)
```
**Action**: Keep doing what you're doing!

### Scenario 2: Break-even Day
```
Total Sales: KES 12,000 (8 transactions)
Total Expenses: KES 12,000 (5 transactions)
Net Profit: KES 0 (Break-even)
Profit Margin: 0%
```
**Action**: Reduce expenses or increase sales

### Scenario 3: Loss Day
```
Total Sales: KES 8,000 (5 transactions)
Total Expenses: KES 15,000 (7 transactions)
Net Profit: -KES 7,000 (Loss)
Profit Margin: -87.5% (Negative)
```
**Action**: Urgent - reduce expenses immediately

---

**Version**: 3.2.0  
**Status**: ✅ Active  
**Access**: Sidebar → Daily Tracker

**Track your business performance every day!** 📅💰📈
