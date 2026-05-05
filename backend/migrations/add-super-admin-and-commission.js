const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'biztrack.db');
const db = new sqlite3.Database(dbPath);

console.log('Adding super admin role and commission system...');
console.log('Connected to SQLite database at:', dbPath);

db.serialize(() => {
  // 1. Add subscription and commission columns to users table
  db.run(`
    ALTER TABLE users ADD COLUMN subscription_plan TEXT DEFAULT 'free'
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding subscription_plan:', err);
    } else {
      console.log('✅ subscription_plan column added/exists');
    }
  });

  db.run(`
    ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'active'
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding subscription_status:', err);
    } else {
      console.log('✅ subscription_status column added/exists');
    }
  });

  db.run(`
    ALTER TABLE users ADD COLUMN commission_rate REAL DEFAULT 0
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding commission_rate:', err);
    } else {
      console.log('✅ commission_rate column added/exists');
    }
  });

  // 2. Create commissions table
  db.run(`
    CREATE TABLE IF NOT EXISTS commissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      transaction_id INTEGER,
      amount REAL NOT NULL,
      commission_amount REAL NOT NULL,
      commission_rate REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      paid_at TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating commissions table:', err);
    } else {
      console.log('✅ Commissions table created/exists');
    }
  });

  // 3. Create subscription_plans table
  db.run(`
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      price REAL NOT NULL,
      commission_rate REAL NOT NULL,
      features TEXT,
      max_transactions INTEGER,
      max_users INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating subscription_plans table:', err);
    } else {
      console.log('✅ Subscription plans table created/exists');
    }
  });

  // 4. Insert default subscription plans
  const plans = [
    { name: 'free', price: 0, commission_rate: 5.0, features: JSON.stringify(['Basic features', '100 transactions/month', '1 user']), max_transactions: 100, max_users: 1 },
    { name: 'basic', price: 999, commission_rate: 3.0, features: JSON.stringify(['All features', '1000 transactions/month', '3 users']), max_transactions: 1000, max_users: 3 },
    { name: 'pro', price: 2999, commission_rate: 2.0, features: JSON.stringify(['All features', 'Unlimited transactions', '10 users', 'Priority support']), max_transactions: -1, max_users: 10 },
    { name: 'enterprise', price: 9999, commission_rate: 1.0, features: JSON.stringify(['All features', 'Unlimited everything', 'Unlimited users', 'Dedicated support']), max_transactions: -1, max_users: -1 }
  ];

  const insertPlan = db.prepare(`
    INSERT OR IGNORE INTO subscription_plans (name, price, commission_rate, features, max_transactions, max_users)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  plans.forEach(plan => {
    insertPlan.run(plan.name, plan.price, plan.commission_rate, plan.features, plan.max_transactions, plan.max_users);
  });

  insertPlan.finalize(() => {
    console.log('✅ Default subscription plans inserted');
  });

  // 5. Update existing users to have commission rate based on their plan
  db.run(`
    UPDATE users 
    SET commission_rate = 5.0 
    WHERE commission_rate = 0 AND role = 'user'
  `, (err) => {
    if (err) {
      console.error('Error updating commission rates:', err);
    } else {
      console.log('✅ Commission rates updated for existing users');
    }
  });

  // 6. Create platform_settings table for super admin configuration
  db.run(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT NOT NULL UNIQUE,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating platform_settings table:', err);
    } else {
      console.log('✅ Platform settings table created/exists');
    }
  });

  // 7. Insert default platform settings
  const settings = [
    { key: 'default_commission_rate', value: '5.0' },
    { key: 'platform_name', value: 'BizTrack' },
    { key: 'allow_registration', value: 'true' },
    { key: 'require_approval', value: 'false' }
  ];

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO platform_settings (setting_key, setting_value)
    VALUES (?, ?)
  `);

  settings.forEach(setting => {
    insertSetting.run(setting.key, setting.value);
  });

  insertSetting.finalize(() => {
    console.log('✅ Default platform settings inserted');
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Create super admin: node create-super-admin.js');
    console.log('2. Restart backend: npm start');
    db.close();
  });
});
