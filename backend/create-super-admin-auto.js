const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'biztrack.db');
const db = new sqlite3.Database(dbPath);

// Default super admin credentials
const email = 'admin@biztrack.com';
const password = 'superadmin123';
const businessName = 'BizTrack Platform';

console.log('Creating super admin account...');

async function createSuperAdmin() {
  try {
    // Check if super admin already exists
    db.get('SELECT * FROM users WHERE role = ?', ['super_admin'], async (err, existingAdmin) => {
      if (err) {
        console.error('❌ Database error:', err);
        db.close();
        return;
      }

      if (existingAdmin) {
        console.log('\n⚠️  Super admin already exists:');
        console.log(`Email: ${existingAdmin.email}`);
        console.log(`Business: ${existingAdmin.business_name}`);
        db.close();
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create super admin
      db.run(`
        INSERT INTO users (email, password, business_name, role, subscription_plan, subscription_status, commission_rate)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [email, hashedPassword, businessName, 'super_admin', 'enterprise', 'active', 0], function(err) {
        if (err) {
          console.error('❌ Error creating super admin:', err);
        } else {
          console.log('\n✅ Super Admin created successfully!');
          console.log('');
          console.log('='.repeat(50));
          console.log('SUPER ADMIN CREDENTIALS');
          console.log('='.repeat(50));
          console.log(`Email: ${email}`);
          console.log(`Password: ${password}`);
          console.log(`Business: ${businessName}`);
          console.log(`Role: super_admin`);
          console.log('');
          console.log('⚠️  IMPORTANT: Change the password after first login!');
          console.log('');
          console.log('Login at: http://localhost:3002');
          console.log('='.repeat(50));
        }
        db.close();
      });
    });
  } catch (error) {
    console.error('❌ Error:', error);
    db.close();
  }
}

createSuperAdmin();
