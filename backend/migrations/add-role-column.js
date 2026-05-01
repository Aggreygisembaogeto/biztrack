const { run } = require('../config/database-production');

async function addRoleColumn() {
  try {
    console.log('Adding role column to users table...');
    
    // Add role column (default to 'user')
    await run(`
      ALTER TABLE users 
      ADD COLUMN role TEXT DEFAULT 'user'
    `);
    
    console.log('✅ Role column added successfully');
    
    // Update admin user to have admin role
    await run(`
      UPDATE users 
      SET role = 'admin' 
      WHERE email = 'admin@biztrack.com'
    `);
    
    console.log('✅ Admin user role updated');
    
    process.exit(0);
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✅ Role column already exists');
      
      // Still update admin user
      await run(`
        UPDATE users 
        SET role = 'admin' 
        WHERE email = 'admin@biztrack.com'
      `);
      
      console.log('✅ Admin user role updated');
      process.exit(0);
    } else {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }
}

addRoleColumn();
