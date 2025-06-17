#!/usr/bin/env node

/**
 * NodePilot Setup Verification Script
 * Verifies that the development environment is properly configured
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description}`, 'red');
    return false;
  }
}

function checkCommand(command, description) {
  try {
    execSync(command, { stdio: 'ignore' });
    log(`✅ ${description}`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description}`, 'red');
    return false;
  }
}

function checkEnvironmentFile(filePath, requiredVars) {
  if (!fs.existsSync(filePath)) {
    log(`❌ ${filePath} not found`, 'red');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const missingVars = [];

  requiredVars.forEach(varName => {
    if (!content.includes(varName) || content.includes(`${varName}=your_`)) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length === 0) {
    log(`✅ ${filePath} properly configured`, 'green');
    return true;
  } else {
    log(`⚠️  ${filePath} missing or has placeholder values for: ${missingVars.join(', ')}`, 'yellow');
    return false;
  }
}

function main() {
  log('\n🔍 NodePilot Setup Verification', 'cyan');
  log('================================\n', 'cyan');

  let allChecksPass = true;

  // Check Node.js version
  log('📦 Checking Node.js...', 'blue');
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    
    if (majorVersion >= 18) {
      log(`✅ Node.js ${nodeVersion} (compatible)`, 'green');
    } else {
      log(`❌ Node.js ${nodeVersion} (requires 18+)`, 'red');
      allChecksPass = false;
    }
  } catch (error) {
    log('❌ Node.js not found', 'red');
    allChecksPass = false;
  }

  // Check Git
  log('\n📦 Checking Git...', 'blue');
  if (!checkCommand('git --version', 'Git installed')) {
    allChecksPass = false;
  }

  // Check project files
  log('\n📁 Checking project structure...', 'blue');
  const projectFiles = [
    ['package.json', 'Frontend package.json'],
    ['backend/package.json', 'Backend package.json'],
    ['src/app/layout.tsx', 'Next.js app structure'],
    ['backend/src/server.ts', 'Backend server file'],
    ['.gitignore', 'Git ignore file']
  ];

  projectFiles.forEach(([file, desc]) => {
    if (!checkFile(file, desc)) {
      allChecksPass = false;
    }
  });

  // Check dependencies
  log('\n📦 Checking dependencies...', 'blue');
  const dependencyChecks = [
    ['node_modules', 'Frontend dependencies installed'],
    ['backend/node_modules', 'Backend dependencies installed']
  ];

  dependencyChecks.forEach(([dir, desc]) => {
    if (!checkFile(dir, desc)) {
      allChecksPass = false;
    }
  });

  // Check environment files
  log('\n🔐 Checking environment configuration...', 'blue');
  
  const frontendEnvVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'ANTHROPIC_API_KEY'
  ];

  const backendEnvVars = [
    'SUPABASE_URL',
    'CLERK_SECRET_KEY',
    'ANTHROPIC_API_KEY',
    'JWT_SECRET'
  ];

  const frontendEnvOk = checkEnvironmentFile('.env.local', frontendEnvVars);
  const backendEnvOk = checkEnvironmentFile('backend/.env', backendEnvVars);

  if (!frontendEnvOk || !backendEnvOk) {
    allChecksPass = false;
  }

  // Check build capability
  log('\n🔨 Checking build capability...', 'blue');
  try {
    log('Testing frontend build...', 'blue');
    execSync('npm run build', { stdio: 'ignore', timeout: 60000 });
    log('✅ Frontend builds successfully', 'green');
  } catch (error) {
    log('❌ Frontend build failed', 'red');
    allChecksPass = false;
  }

  try {
    log('Testing backend build...', 'blue');
    execSync('cd backend && npm run build', { stdio: 'ignore', timeout: 60000 });
    log('✅ Backend builds successfully', 'green');
  } catch (error) {
    log('❌ Backend build failed', 'red');
    allChecksPass = false;
  }

  // Final result
  log('\n' + '='.repeat(50), 'cyan');
  if (allChecksPass) {
    log('🎉 All checks passed! Your setup is ready for development.', 'green');
    log('\nNext steps:', 'blue');
    log('1. Start frontend: npm run dev', 'cyan');
    log('2. Start backend: cd backend && npm run dev', 'cyan');
    log('3. Open http://localhost:8080 in your browser', 'cyan');
  } else {
    log('⚠️  Some checks failed. Please review the issues above.', 'yellow');
    log('\nCommon fixes:', 'blue');
    log('1. Update environment variables with real values', 'cyan');
    log('2. Run: npm install && cd backend && npm install', 'cyan');
    log('3. Check NEW_COMPUTER_SETUP.md for detailed instructions', 'cyan');
  }
  log('');
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, checkCommand, checkEnvironmentFile };
