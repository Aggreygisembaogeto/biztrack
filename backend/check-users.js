const { query } = require('./config/database-production');

async function checkUsers() {
  try {
    console.log('Checking users in database...');
    const users = await query('SELECT id, email, business_name FROM users');
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Business: ${user.business_name}`);
    });
    
    if (users.length === 0) {
      console.log('\n⚠️  No users found in database!');
      console.log('You need to register a user first.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
