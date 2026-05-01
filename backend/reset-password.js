const bcrypt = require('bcryptjs');
const { run, get } = require('./config/database-production');

async function resetPassword() {
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3];
    
    if (!email || !newPassword) {
      console.log('Usage: node reset-password.js <email> <new-password>');
      console.log('Example: node reset-password.js gisembaaggrey@gmail.com newpass123');
      process.exit(1);
    }
    
    // Check if user exists
    const user = await get('SELECT id, email, business_name FROM users WHERE email = ?', [email]);
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }
    
    console.log(`Found user: ${user.email} (${user.business_name})`);
    console.log('Resetting password...');
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
    
    console.log('✅ Password reset successfully!');
    console.log(`Email: ${email}`);
    console.log(`New Password: ${newPassword}`);
    console.log('\nYou can now login with these credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();
