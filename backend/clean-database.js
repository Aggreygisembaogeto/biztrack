const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'biztrack.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to database');
});

// Clean all data except admin user
const cleanDatabase = () => {
  db.serialize(() => {
    console.log('\n🧹 Cleaning database...\n');

    // Delete all non-admin users
    db.run(`DELETE FROM users WHERE role != 'admin'`, function(err) {
      if (err) {
        console.error('Error deleting users:', err);
      } else {
        console.log(`✓ Deleted ${this.changes} non-admin users`);
      }
    });

    // Delete all transactions
    db.run(`DELETE FROM transactions`, function(err) {
      if (err) {
        console.error('Error deleting transactions:', err);
      } else {
        console.log(`✓ Deleted ${this.changes} transactions`);
      }
    });

    // Delete all sales
    db.run(`DELETE FROM sales`, function(err) {
      if (err) {
        console.error('Error deleting sales:', err);
      } else {
        console.log(`✓ Deleted ${this.changes} sales records`);
      }
    });

    // Delete all inventory items
    db.run(`DELETE FROM inventory`, function(err) {
      if (err) {
        console.error('Error deleting inventory:', err);
      } else {
        console.log(`✓ Deleted ${this.changes} inventory items`);
      }
    });

    // Delete all orders
    db.run(`DELETE FROM orders`, function(err) {
      if (err) {
        console.error('Error deleting orders:', err);
      } else {
        console.log(`✓ Deleted ${this.changes} orders`);
      }
    });

    // Reset SQLite sequence counters
    db.run(`DELETE FROM sqlite_sequence WHERE name != 'users'`, function(err) {
      if (err) {
        console.error('Error resetting sequences:', err);
      } else {
        console.log(`✓ Reset auto-increment counters`);
      }
    });

    // Show remaining users
    db.all(`SELECT id, email, business_name, role FROM users`, (err, rows) => {
      if (err) {
        console.error('Error fetching users:', err);
      } else {
        console.log('\n📋 Remaining users:');
        if (rows.length === 0) {
          console.log('   No users found');
        } else {
          rows.forEach(user => {
            console.log(`   - ${user.email} (${user.business_name}) - Role: ${user.role || 'user'}`);
          });
        }
      }

      console.log('\n✅ Database cleaned successfully!');
      console.log('   The system is now ready for new users.\n');
      
      db.close();
    });
  });
};

cleanDatabase();
