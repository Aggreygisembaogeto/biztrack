# 🗄️ Database Setup for Vercel Deployment

## Overview

For Vercel deployment, you need an external database because Vercel is serverless (SQLite won't persist).

## Best Options for Your App

### Option 1: Vercel Postgres (Recommended - Easiest)
- ✅ Built into Vercel
- ✅ Easy setup (3 clicks)
- ✅ Free tier available
- ✅ Automatic connection
- ⚠️ Requires code changes (SQLite → PostgreSQL)

### Option 2: Supabase (Free, Easy)
- ✅ Free tier (500MB database)
- ✅ PostgreSQL database
- ✅ Easy setup
- ✅ Good documentation
- ⚠️ Requires code changes

### Option 3: Railway Postgres (Good Alternative)
- ✅ Free tier ($5 credit)
- ✅ PostgreSQL database
- ✅ Easy setup
- ⚠️ Requires code changes

### Option 4: Keep SQLite + Deploy Backend Separately
- ✅ No code changes needed
- ✅ Use Railway for backend (SQLite works)
- ✅ Use Vercel for frontend only
- ✅ **This is the easiest option!**

---

## Recommended: Hybrid Deployment (No Code Changes)

**Frontend on Vercel + Backend on Railway**

This is the **easiest approach** because:
- ✅ No database migration needed
- ✅ SQLite works on Railway
- ✅ No code changes required
- ✅ Both have free tiers

**See**: `VERCEL_DEPLOYMENT.md` for complete guide

---

## Option 1: Vercel Postgres Setup

If you want everything on Vercel, follow these steps:

### Step 1: Create Vercel Postgres Database

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project (or create new)

2. **Create Database**
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose database name: `biztrack-db`
   - Select region (closest to your users)
   - Click "Create"

3. **Get Connection Details**
   - Vercel will show connection string
   - Copy the `POSTGRES_URL` value

### Step 2: Update Backend Code for PostgreSQL

I'll create the necessary files for you:

**1. Install PostgreSQL Driver**

Update `backend/package.json`:
```json
{
  "dependencies": {
    "pg": "^8.11.0",
    ...existing dependencies
  }
}
```

**2. Create PostgreSQL Database Config**

Create `backend/config/database-postgres.js`:
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Test connection
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Initialize database schema
async function initDatabase() {
  const client = await pool.connect();
  
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        business_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inventory table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        min_stock DECIMAL(10,2) DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sales table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_name VARCHAR(255) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        payment_status VARCHAR(50) NOT NULL,
        customer_phone VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        platform VARCHAR(50) NOT NULL,
        items TEXT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        category VARCHAR(100),
        description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)');

    console.log('✓ Database schema initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Query helper
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

module.exports = {
  query,
  pool,
  initDatabase
};
```

**3. Update Server to Use PostgreSQL**

Update `backend/server-production.js` to use the new database config:

```javascript
// At the top, change the database import
const { initDatabase } = require('./config/database-postgres');

// Rest of the file stays the same
```

### Step 3: Add Environment Variables

**In Vercel Dashboard**:
1. Go to your project
2. Settings → Environment Variables
3. Add:

```
NODE_ENV=production
JWT_SECRET=<your-strong-secret>
POSTGRES_URL=<from-vercel-postgres>
FRONTEND_URL=https://your-app.vercel.app
```

### Step 4: Deploy

```bash
cd backend
npm install pg
git add .
git commit -m "Add PostgreSQL support"
git push

# Deploy to Vercel
vercel --prod
```

---

## Option 2: Supabase Setup

### Step 1: Create Supabase Project

1. **Go to Supabase**
   - Visit: https://supabase.com
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Name: `biztrack`
   - Database Password: (generate strong password)
   - Region: (closest to your users)
   - Click "Create new project"

3. **Get Connection String**
   - Go to Project Settings → Database
   - Copy "Connection string" (URI format)
   - Replace `[YOUR-PASSWORD]` with your password

### Step 2: Use Same PostgreSQL Config

Use the same `database-postgres.js` file from Option 1.

### Step 3: Add Environment Variable

```
POSTGRES_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

---

## Option 3: Railway Postgres

### Step 1: Create Railway Postgres

1. **Go to Railway**
   - Visit: https://railway.app
   - Login with GitHub

2. **Add Database**
   - In your project, click "New"
   - Select "Database"
   - Choose "PostgreSQL"
   - Railway creates database automatically

3. **Get Connection String**
   - Click on PostgreSQL service
   - Go to "Connect" tab
   - Copy "Postgres Connection URL"

### Step 2: Use Same PostgreSQL Config

Use the same `database-postgres.js` file from Option 1.

### Step 3: Add Environment Variable

```
POSTGRES_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

---

## Migration Script (SQLite to PostgreSQL)

If you have existing data in SQLite, use this script to migrate:

Create `backend/migrate-to-postgres.js`:

```javascript
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

const sqliteDb = new sqlite3.Database('./data/biztrack.db');
const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URL
});

async function migrate() {
  console.log('Starting migration...');

  try {
    // Migrate users
    const users = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const user of users) {
      await pgPool.query(
        'INSERT INTO users (id, email, password, business_name, role, created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
        [user.id, user.email, user.password, user.business_name, user.role, user.created_at]
      );
    }
    console.log(`✓ Migrated ${users.length} users`);

    // Migrate inventory
    const inventory = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM inventory', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const item of inventory) {
      await pgPool.query(
        'INSERT INTO inventory (id, user_id, name, quantity, unit, price, min_stock, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING',
        [item.id, item.user_id, item.name, item.quantity, item.unit, item.price, item.min_stock, item.created_at]
      );
    }
    console.log(`✓ Migrated ${inventory.length} inventory items`);

    // Migrate sales
    const sales = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM sales', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const sale of sales) {
      await pgPool.query(
        'INSERT INTO sales (id, user_id, item_name, quantity, unit, price, total, payment_status, customer_phone, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING',
        [sale.id, sale.user_id, sale.item_name, sale.quantity, sale.unit, sale.price, sale.total, sale.payment_status, sale.customer_phone, sale.created_at]
      );
    }
    console.log(`✓ Migrated ${sales.length} sales`);

    // Migrate orders
    const orders = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM orders', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const order of orders) {
      await pgPool.query(
        'INSERT INTO orders (id, user_id, customer_name, customer_phone, platform, items, total, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
        [order.id, order.user_id, order.customer_name, order.customer_phone, order.platform, order.items, order.total, order.status, order.created_at]
      );
    }
    console.log(`✓ Migrated ${orders.length} orders`);

    // Migrate transactions
    const transactions = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM transactions', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const transaction of transactions) {
      await pgPool.query(
        'INSERT INTO transactions (id, user_id, type, category, description, amount, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
        [transaction.id, transaction.user_id, transaction.type, transaction.category, transaction.description, transaction.amount, transaction.created_at]
      );
    }
    console.log(`✓ Migrated ${transactions.length} transactions`);

    console.log('✓ Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    sqliteDb.close();
    await pgPool.end();
  }
}

migrate();
```

**Run migration**:
```bash
cd backend
POSTGRES_URL=your-postgres-url node migrate-to-postgres.js
```

---

## Comparison

| Option | Setup Time | Code Changes | Cost | Best For |
|--------|-----------|--------------|------|----------|
| **Hybrid (Vercel + Railway)** | 10 min | None | Free | Easiest, recommended |
| **Vercel Postgres** | 15 min | Medium | Free tier | All-in-one Vercel |
| **Supabase** | 15 min | Medium | Free tier | External PostgreSQL |
| **Railway Postgres** | 15 min | Medium | $5 credit | Railway ecosystem |

---

## Recommendation

### For Quickest Deployment:
**Use Hybrid Approach** (Frontend on Vercel + Backend on Railway)
- ✅ No code changes
- ✅ SQLite works
- ✅ 10 minutes setup
- ✅ See `VERCEL_DEPLOYMENT.md`

### For All-in-One Vercel:
**Use Vercel Postgres**
- ⚠️ Requires code changes
- ⚠️ Need to migrate data
- ✅ Everything on Vercel
- ✅ 15 minutes setup

---

## Next Steps

**Choose your approach**:

1. **Hybrid (Easiest)** → See `VERCEL_DEPLOYMENT.md`
2. **Vercel Postgres** → Follow Option 1 above
3. **Supabase** → Follow Option 2 above
4. **Railway Postgres** → Follow Option 3 above

---

## Support

- **Vercel Postgres Docs**: https://vercel.com/docs/storage/vercel-postgres
- **Supabase Docs**: https://supabase.com/docs
- **Railway Docs**: https://docs.railway.app
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

**Need help?** Open an issue on GitHub or check the documentation above.
