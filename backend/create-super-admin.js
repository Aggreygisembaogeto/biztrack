const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const readline = require('readline');

const dbPath = path.join(__dirname, 'data', 'biztrack.db');
const db = new sqlite3.Database(dbPath);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('='.repeat(50));
console.log('CREATE SUPER ADMIN ACCOUNT');
console.log('='.repeat(50));
console.log('');

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createSuperAdmin() {
  try {
    const email = await question('Enter super admin email: ');
    const password = await question('Enter password (min 6 characters): ');
    const businessName = await question('Enter platform name (default: BizTrack Platform): ') || 'BizTrack Platform';

    // Validate
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address');
      rl.close();
      db.close();
      return;
    }

    if (!password || password.length < 6) {
      console.error('❌ Password must be at least 6 characters');
      rl.close();
      db.close();
      return;
    }

    // Check if super admin already exists
    db.get('SELECT * FROM users WHERE role = ?', ['super_admin'], async (err, existingAdmin) => {
      if (err) {
        console.error('❌ Database error:', err);
        rl.close();
        db.close();
        return;
      }

      if (existingAdmin) {
        console.log('\n⚠️  Super admin already exists:');
        console.log(`Email: ${existingAdmin.email}`);
        console.log(`Business: ${existingAdmin.business_name}`);
        console.log('\nUse remove-super-admin.js to remove existing super admin first.');
        rl.close();
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
          console.log('SUPER ADMIN DETAILS');
          console.log('='.repeat(50));
          console.log(`Email: ${email}`);
          console.log(`Business: ${businessName}`);
          console.log(`Role: super_admin`);
          console.log(`Plan: enterprise`);
          console.log(`Commission Rate: 0% (Super admin doesn't pay commission)`);
          console.log('');
          console.log('Super Admin Capabilities:');
          console.log('✓ Manage all users');
          console.log('✓ View all transactions');
          console.log('✓ Collect commissions from users');
          console.log('✓ Manage subscription plans');
          console.log('✓ Platform settings');
          console.log('✓ Full system access');
          console.log('');
          console.log('Login at: http://localhost:3002');
          console.log('='.repeat(50));
        }
        rl.close();
        db.close();
      });
    });
  } catch (error) {
    console.error('❌ Error:', error);
    rl.close();
    db.close();
  }
}

createSuperAdmin();
