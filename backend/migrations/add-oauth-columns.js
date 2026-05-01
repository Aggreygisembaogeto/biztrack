const { run, get } = require('../config/database-production');

async function addOAuthColumns() {
  try {
    console.log('Adding OAuth columns to users table...');
    
    // Try to add oauth_provider column
    try {
      await run('ALTER TABLE users ADD COLUMN oauth_provider TEXT');
      console.log('✅ Added oauth_provider column');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('ℹ️  oauth_provider column already exists');
      } else {
        throw error;
      }
    }
    
    // Try to add oauth_id column
    try {
      await run('ALTER TABLE users ADD COLUMN oauth_id TEXT');
      console.log('✅ Added oauth_id column');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('ℹ️  oauth_id column already exists');
      } else {
        throw error;
      }
    }
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
addOAuthColumns();
