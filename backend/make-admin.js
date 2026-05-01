const { run, get } = require('./config/database-production');

async function makeAdmin() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: node make-admin.js <email>');
      console.log('Example: node make-admin.js user@example.com');
      process.exit(1);
    }
    
    // Check if user exists
    const user = await get('SELECT id, email, business_name, role FROM users WHERE email = ?', [email]);
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }
    
    if (user.role === 'admin') {
      console.log(`✅ User is already an admin: ${email}`);
      process.exit(0);
    }
    
    // Make user admin
    await run('UPDATE users SET role = ? WHERE email = ?', ['admin', email]);
    
    console.log('✅ User promoted to admin!');
    console.log(`Email: ${email}`);
    console.log(`Business: ${user.business_name}`);
    console.log(`Role: admin`);
    console.log('\nThey can now access the Admin Panel.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

makeAdmin();
