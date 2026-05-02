#!/usr/bin/env node

/**
 * BizTrack Deployment Readiness Checker
 * 
 * Run this before deploying to check if everything is configured correctly
 * 
 * Usage: node deploy-check.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 BizTrack Deployment Readiness Check\n');
console.log('═══════════════════════════════════════════════════\n');

let errors = 0;
let warnings = 0;
let passed = 0;

function check(name, condition, errorMsg, isWarning = false) {
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    if (isWarning) {
      console.log(`⚠️  ${name}: ${errorMsg}`);
      warnings++;
    } else {
      console.log(`❌ ${name}: ${errorMsg}`);
      errors++;
    }
  }
}

// Check backend files
console.log('📦 Backend Files:\n');
check(
  'Backend package.json exists',
  fs.existsSync('backend/package.json'),
  'backend/package.json not found'
);
check(
  'Backend server file exists',
  fs.existsSync('backend/server-production.js'),
  'backend/server-production.js not found'
);
check(
  'Backend routes exist',
  fs.existsSync('backend/routes'),
  'backend/routes directory not found'
);
check(
  'Backend controllers exist',
  fs.existsSync('backend/controllers'),
  'backend/controllers directory not found'
);

// Check frontend files
console.log('\n📱 Frontend Files:\n');
check(
  'Frontend package.json exists',
  fs.existsSync('frontend/package.json'),
  'frontend/package.json not found'
);
check(
  'Frontend src exists',
  fs.existsSync('frontend/src'),
  'frontend/src directory not found'
);
check(
  'Frontend index.html exists',
  fs.existsSync('frontend/index.html'),
  'frontend/index.html not found'
);

// Check environment files
console.log('\n🔐 Environment Configuration:\n');
check(
  'Backend .env.example exists',
  fs.existsSync('backend/.env.example'),
  'backend/.env.example not found - create one for deployment reference',
  true
);
check(
  'Frontend .env.example exists',
  fs.existsSync('frontend/.env.example'),
  'frontend/.env.example not found - create one for deployment reference',
  true
);

// Check gitignore
console.log('\n🚫 Git Configuration:\n');
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  check(
    'Database files gitignored',
    gitignore.includes('*.db'),
    'Database files not in .gitignore'
  );
  check(
    '.env files gitignored',
    gitignore.includes('.env'),
    '.env files not in .gitignore'
  );
  check(
    'node_modules gitignored',
    gitignore.includes('node_modules'),
    'node_modules not in .gitignore'
  );
} else {
  check('.gitignore exists', false, '.gitignore not found');
}

// Check documentation
console.log('\n📚 Documentation:\n');
check(
  'README.md exists',
  fs.existsSync('README.md'),
  'README.md not found',
  true
);
check(
  'Deployment guide exists',
  fs.existsSync('DEPLOY_NOW.md'),
  'DEPLOY_NOW.md not found',
  true
);
check(
  'Security documentation exists',
  fs.existsSync('SECURITY.md'),
  'SECURITY.md not found',
  true
);

// Check for sensitive files
console.log('\n🔒 Security Check:\n');
check(
  'No .env files in git',
  !fs.existsSync('backend/.env') || !isFileTracked('backend/.env'),
  'backend/.env should not be committed to git'
);
check(
  'No database files in git',
  !isFileTracked('backend/data/biztrack.db'),
  'Database files should not be committed to git'
);

// Check package.json scripts
console.log('\n⚙️  Scripts Configuration:\n');
if (fs.existsSync('backend/package.json')) {
  const backendPkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  check(
    'Backend has start script',
    backendPkg.scripts && backendPkg.scripts.start,
    'backend/package.json missing start script'
  );
}

if (fs.existsSync('frontend/package.json')) {
  const frontendPkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  check(
    'Frontend has build script',
    frontendPkg.scripts && frontendPkg.scripts.build,
    'frontend/package.json missing build script'
  );
  check(
    'Frontend has start script',
    frontendPkg.scripts && frontendPkg.scripts.start,
    'frontend/package.json missing start script',
    true
  );
}

// Summary
console.log('\n═══════════════════════════════════════════════════\n');
console.log('📊 Summary:\n');
console.log(`✅ Passed: ${passed}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log(`❌ Errors: ${errors}`);
console.log('');

if (errors === 0 && warnings === 0) {
  console.log('🎉 Perfect! Your application is ready for deployment!\n');
  console.log('Next steps:');
  console.log('1. Read DEPLOY_NOW.md for deployment instructions');
  console.log('2. Choose a hosting platform (Railway recommended)');
  console.log('3. Configure environment variables');
  console.log('4. Deploy and test\n');
  process.exit(0);
} else if (errors === 0) {
  console.log('✅ Your application is ready for deployment!\n');
  console.log(`⚠️  You have ${warnings} warning(s) - review them but they won't block deployment.\n`);
  console.log('Next steps:');
  console.log('1. Read DEPLOY_NOW.md for deployment instructions');
  console.log('2. Choose a hosting platform (Railway recommended)');
  console.log('3. Configure environment variables');
  console.log('4. Deploy and test\n');
  process.exit(0);
} else {
  console.log(`❌ Please fix ${errors} error(s) before deploying.\n`);
  console.log('Review the errors above and fix them, then run this check again.\n');
  process.exit(1);
}

// Helper function
function isFileTracked(filePath) {
  try {
    const { execSync } = require('child_process');
    execSync(`git ls-files --error-unmatch ${filePath}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
