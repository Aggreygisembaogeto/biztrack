#!/usr/bin/env node

/**
 * BizTrack - Complete Business Management System
 * Single File Version - Frontend + Backend + Database
 * 
 * This file contains:
 * - Express server
 * - SQLite database
 * - All API routes
 * - React frontend (embedded as HTML string)
 * - Authentication system
 * - Business logic
 * 
 * Usage:
 *   node biztrack-single-file.js
 * 
 * Then open: http://localhost:5001
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// Configuration
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production-min-32-chars';
const DB_PATH = process.env.DB_PATH || './biztrack-single.db';

// Initialize Express
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ============================================================================
// DATABASE SETUP
// ============================================================================

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('✓ Connected to SQLite database');
});

// Initialize database schema
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      business_name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Inventory table
  db.run(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      price REAL NOT NULL,
      min_stock REAL DEFAULT 10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Sales table
  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      price REAL NOT NULL,
      total REAL NOT NULL,
      payment_status TEXT NOT NULL,
      customer_phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      platform TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      category TEXT,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('✓ Database schema initialized');
});

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'BizTrack Single File Server',
    version: '3.0.0',
    timestamp: new Date().toISOString()
  });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, businessName } = req.body;
    
    if (!email || !password || !businessName) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (email, password, business_name) VALUES (?, ?, ?)',
      [email, hashedPassword, businessName],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
          }
          return res.status(500).json({ success: false, message: 'Registration failed' });
        }

        const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '30d' });
        res.json({
          success: true,
          token,
          user: { id: this.lastID, email, businessName, role: 'user' }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          businessName: user.business_name,
          role: user.role
        }
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  db.get('SELECT id, email, business_name, role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        businessName: user.business_name,
        role: user.role
      }
    });
  });
});

// Inventory routes
app.get('/api/inventory', authMiddleware, (req, res) => {
  db.all('SELECT * FROM inventory WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, data: rows });
  });
});

app.post('/api/inventory', authMiddleware, (req, res) => {
  const { name, quantity, unit, price, minStock } = req.body;
  db.run(
    'INSERT INTO inventory (user_id, name, quantity, unit, price, min_stock) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, name, quantity, unit, price, minStock || 10],
    function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Failed to add item' });
      res.json({ success: true, data: { id: this.lastID } });
    }
  );
});

app.put('/api/inventory/:id', authMiddleware, (req, res) => {
  const { name, quantity, unit, price, minStock } = req.body;
  db.run(
    'UPDATE inventory SET name = ?, quantity = ?, unit = ?, price = ?, min_stock = ? WHERE id = ? AND user_id = ?',
    [name, quantity, unit, price, minStock, req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Update failed' });
      res.json({ success: true });
    }
  );
});

app.delete('/api/inventory/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM inventory WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Delete failed' });
    res.json({ success: true });
  });
});

// Sales routes
app.get('/api/sales', authMiddleware, (req, res) => {
  db.all('SELECT * FROM sales WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, data: rows });
  });
});

app.post('/api/sales', authMiddleware, (req, res) => {
  const { itemName, quantity, unit, price, total, paymentStatus, customerPhone } = req.body;
  db.run(
    'INSERT INTO sales (user_id, item_name, quantity, unit, price, total, payment_status, customer_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, itemName, quantity, unit, price, total, paymentStatus, customerPhone],
    function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Failed to add sale' });
      
      // Update inventory
      db.run('UPDATE inventory SET quantity = quantity - ? WHERE user_id = ? AND name = ?', 
        [quantity, req.user.id, itemName]);
      
      res.json({ success: true, data: { id: this.lastID } });
    }
  );
});

// Orders routes
app.get('/api/orders', authMiddleware, (req, res) => {
  db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, data: rows });
  });
});

app.post('/api/orders', authMiddleware, (req, res) => {
  const { customerName, customerPhone, platform, items, total, status } = req.body;
  db.run(
    'INSERT INTO orders (user_id, customer_name, customer_phone, platform, items, total, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, customerName, customerPhone, platform, JSON.stringify(items), total, status || 'pending'],
    function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Failed to create order' });
      res.json({ success: true, data: { id: this.lastID } });
    }
  );
});

// Transactions routes
app.get('/api/transactions', authMiddleware, (req, res) => {
  db.all('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, data: rows });
  });
});

app.post('/api/transactions', authMiddleware, (req, res) => {
  const { type, category, description, amount } = req.body;
  db.run(
    'INSERT INTO transactions (user_id, type, category, description, amount) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, type, category, description, amount],
    function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Failed to add transaction' });
      res.json({ success: true, data: { id: this.lastID } });
    }
  );
});

app.get('/api/transactions/summary', authMiddleware, (req, res) => {
  db.all(`
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
    FROM transactions WHERE user_id = ?
  `, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    const summary = rows[0] || { total_income: 0, total_expense: 0 };
    res.json({
      success: true,
      data: {
        totalIncome: summary.total_income || 0,
        totalExpense: summary.total_expense || 0,
        netProfit: (summary.total_income || 0) - (summary.total_expense || 0)
      }
    });
  });
});

// ============================================================================
// FRONTEND (Embedded HTML/CSS/JS)
// ============================================================================

const FRONTEND_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BizTrack - Business Management</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 40px;
      max-width: 400px;
      width: 100%;
    }
    h1 {
      color: #667eea;
      margin-bottom: 10px;
      font-size: 32px;
      text-align: center;
    }
    .subtitle {
      color: #666;
      text-align: center;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
      font-size: 14px;
    }
    input {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 14px;
      transition: all 0.3s;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }
    button:active {
      transform: translateY(0);
    }
    .toggle-link {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 14px;
    }
    .toggle-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    .toggle-link a:hover {
      text-decoration: underline;
    }
    .error {
      background: #fee;
      color: #c33;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      border-left: 4px solid #c33;
    }
    .success {
      background: #efe;
      color: #3c3;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      border-left: 4px solid #3c3;
    }
    .dashboard {
      max-width: 1200px;
      padding: 20px;
    }
    .dashboard h2 {
      color: white;
      margin-bottom: 20px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .stat-card h3 {
      color: #666;
      font-size: 14px;
      margin-bottom: 10px;
    }
    .stat-card .value {
      color: #667eea;
      font-size: 28px;
      font-weight: bold;
    }
    .logout-btn {
      background: #ff4757;
      margin-top: 20px;
    }
    .hidden {
      display: none;
    }
  </style>
</head>
<body>
  <div id="app"></div>

  <script>
    const API_URL = '';
    let token = localStorage.getItem('biztrack_token');
    let currentView = token ? 'dashboard' : 'login';

    function render() {
      const app = document.getElementById('app');
      
      if (currentView === 'login') {
        app.innerHTML = \`
          <div class="container">
            <h1>🚀 BizTrack</h1>
            <p class="subtitle">Business Management System</p>
            <div id="message"></div>
            <form id="loginForm">
              <div class="form-group">
                <label>Email</label>
                <input type="email" id="email" required placeholder="your@email.com">
              </div>
              <div class="form-group">
                <label>Password</label>
                <input type="password" id="password" required placeholder="••••••••">
              </div>
              <button type="submit">Login</button>
            </form>
            <div class="toggle-link">
              Don't have an account? <a href="#" onclick="switchView('register')">Register</a>
            </div>
          </div>
        \`;
        document.getElementById('loginForm').onsubmit = handleLogin;
      } else if (currentView === 'register') {
        app.innerHTML = \`
          <div class="container">
            <h1>🚀 BizTrack</h1>
            <p class="subtitle">Create Your Account</p>
            <div id="message"></div>
            <form id="registerForm">
              <div class="form-group">
                <label>Business Name</label>
                <input type="text" id="businessName" required placeholder="My Business">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" id="email" required placeholder="your@email.com">
              </div>
              <div class="form-group">
                <label>Password</label>
                <input type="password" id="password" required placeholder="••••••••">
              </div>
              <button type="submit">Create Account</button>
            </form>
            <div class="toggle-link">
              Already have an account? <a href="#" onclick="switchView('login')">Login</a>
            </div>
          </div>
        \`;
        document.getElementById('registerForm').onsubmit = handleRegister;
      } else if (currentView === 'dashboard') {
        app.innerHTML = \`
          <div class="dashboard">
            <h2>📊 Dashboard</h2>
            <div class="stats">
              <div class="stat-card">
                <h3>Total Sales</h3>
                <div class="value" id="totalSales">Loading...</div>
              </div>
              <div class="stat-card">
                <h3>Total Orders</h3>
                <div class="value" id="totalOrders">Loading...</div>
              </div>
              <div class="stat-card">
                <h3>Inventory Items</h3>
                <div class="value" id="totalInventory">Loading...</div>
              </div>
              <div class="stat-card">
                <h3>Net Profit</h3>
                <div class="value" id="netProfit">Loading...</div>
              </div>
            </div>
            <div class="container">
              <h3 style="margin-bottom: 20px;">Welcome to BizTrack!</h3>
              <p style="margin-bottom: 15px; color: #666;">Your business management system is ready.</p>
              <p style="margin-bottom: 15px; color: #666;">This is a single-file demo. For full features, use the complete application.</p>
              <button class="logout-btn" onclick="handleLogout()">Logout</button>
            </div>
          </div>
        \`;
        loadDashboardData();
      }
    }

    async function handleLogin(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const res = await fetch(API_URL + '/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success) {
          token = data.token;
          localStorage.setItem('biztrack_token', token);
          currentView = 'dashboard';
          render();
        } else {
          showMessage(data.message, 'error');
        }
      } catch (error) {
        showMessage('Login failed', 'error');
      }
    }

    async function handleRegister(e) {
      e.preventDefault();
      const businessName = document.getElementById('businessName').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const res = await fetch(API_URL + '/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessName, email, password })
        });
        const data = await res.json();

        if (data.success) {
          token = data.token;
          localStorage.setItem('biztrack_token', token);
          currentView = 'dashboard';
          render();
        } else {
          showMessage(data.message, 'error');
        }
      } catch (error) {
        showMessage('Registration failed', 'error');
      }
    }

    function handleLogout() {
      token = null;
      localStorage.removeItem('biztrack_token');
      currentView = 'login';
      render();
    }

    async function loadDashboardData() {
      try {
        const headers = { 'Authorization': 'Bearer ' + token };
        
        const [sales, orders, inventory, summary] = await Promise.all([
          fetch(API_URL + '/api/sales', { headers }).then(r => r.json()),
          fetch(API_URL + '/api/orders', { headers }).then(r => r.json()),
          fetch(API_URL + '/api/inventory', { headers }).then(r => r.json()),
          fetch(API_URL + '/api/transactions/summary', { headers }).then(r => r.json())
        ]);

        document.getElementById('totalSales').textContent = sales.data?.length || 0;
        document.getElementById('totalOrders').textContent = orders.data?.length || 0;
        document.getElementById('totalInventory').textContent = inventory.data?.length || 0;
        document.getElementById('netProfit').textContent = 'KES ' + (summary.data?.netProfit || 0).toLocaleString();
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    }

    function showMessage(message, type) {
      const messageDiv = document.getElementById('message');
      messageDiv.innerHTML = \`<div class="\${type}">\${message}</div>\`;
      setTimeout(() => messageDiv.innerHTML = '', 5000);
    }

    function switchView(view) {
      currentView = view;
      render();
    }

    // Initial render
    render();
  </script>
</body>
</html>
`;

// Serve frontend
app.get('*', (req, res) => {
  res.send(FRONTEND_HTML);
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════');
  console.log('  🚀 BizTrack Single File Server');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  ✓ Server: http://localhost:${PORT}`);
  console.log(`  ✓ API: http://localhost:${PORT}/api`);
  console.log(`  ✓ Database: ${DB_PATH}`);
  console.log(`  ✓ Mode: Single File (Frontend + Backend)`);
  console.log('═══════════════════════════════════════════════════');
  console.log('  📝 Note: This is a simplified single-file version');
  console.log('  📝 For full features, use the complete application');
  console.log('═══════════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n✓ Closing database connection...');
  db.close((err) => {
    if (err) console.error(err);
    console.log('✓ Server stopped');
    process.exit(0);
  });
});
