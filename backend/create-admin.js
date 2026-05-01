const bcrypt = require('bcryptjs');
const { run, get } = require('./config/database-production');

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    
    // Check if admin already exists
    const existing = await get('SELECT id FROM users WHERE email = ?', ['admin@biztrack.com']);
    
    if (existing) {
      console.log('✅ Admin user already exists!');
      console.log('Email: admin@biztrack.com');
      console.log('Password: admin123');
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Create admin user
    await run(
      'INSERT INTO users (email, password, business_name, phone, address) VALUES (?, ?, ?, ?, ?)',
      ['admin@biztrack.com', hashedPassword, 'BizTrack Admin', '+254700000000', 'Nairobi, Kenya']
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@biztrack.com');
    console.log('Password: admin123');
    console.log('\nYou can now login with these credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
