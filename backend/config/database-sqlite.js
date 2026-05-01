const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create SQLite database
const dbPath = path.join(__dirname, '../business_dashboard.db');
const db = new sqlite3.Database(dbPath);

// Initialize database schema
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      business_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('order', 'payment')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
      description TEXT,
      customer_phone TEXT,
      mpesa_receipt TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)`);

  console.log('SQLite database initialized');
});

// Promisify database operations
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve({ rows });
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ rows: [{ id: this.lastID }], lastID: this.lastID });
    });
  });
};

module.exports = {
  query: (sql, params) => {
    if (sql.includes('RETURNING')) {
      // Handle PostgreSQL RETURNING clause
      const insertSql = sql.split('RETURNING')[0].trim();
      return run(insertSql, params).then(result => {
        const id = result.lastID;
        const selectSql = `SELECT * FROM ${sql.match(/INTO (\w+)/)[1]} WHERE id = ?`;
        return query(selectSql, [id]);
      });
    } else if (sql.toUpperCase().startsWith('INSERT') || 
               sql.toUpperCase().startsWith('UPDATE') || 
               sql.toUpperCase().startsWith('DELETE')) {
      return run(sql, params);
    } else {
      return query(sql, params);
    }
  }
};
