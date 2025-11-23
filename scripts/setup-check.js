#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if all required configuration is in place
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
  'package.json',
  'next.config.ts',
  'tsconfig.json',
  '.env.local',
  'lib/youtube-oauth.ts',
  'app/api/convert/route.ts',
  'app/api/auth/callback/route.ts'
];

const REQUIRED_DEPENDENCIES = [
  'next',
  '@distube/ytdl-core',
  'react',
  'react-dom'
];

const ENV_CONFIGS = {
  auto_refresh: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'],
  static_token: ['YOUTUBE_OAUTH_TOKEN'],
};

console.log('🔍 YouTube Audio Converter - Setup Verification\n');
console.log('=' .repeat(60));

// Check Node.js version
const nodeVersion = process.versions.node;
const majorVersion = parseInt(nodeVersion.split('.')[0]);

console.log(`\n📦 Node.js Version: ${nodeVersion}`);
if (majorVersion >= 20) {
  console.log('   ✅ Node.js version is compatible');
} else {
  console.log('   ❌ Node.js 20.x or higher required');
  process.exit(1);
}

// Check required files
console.log('\n📁 Required Files:');
let allFilesExist = true;
REQUIRED_FILES.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Check package.json and dependencies
console.log('\n📦 Dependencies:');
try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
  );
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  REQUIRED_DEPENDENCIES.forEach(dep => {
    const installed = dep in allDeps;
    console.log(`   ${installed ? '✅' : '❌'} ${dep}${installed ? ` (${allDeps[dep]})` : ''}`);
  });
} catch (error) {
  console.log('   ❌ Could not read package.json');
}

// Check environment configuration
console.log('\n🔐 Environment Configuration:');
const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('   ⚠️  .env.local not found');
  console.log('   💡 Run: cp .env.example .env.local');
} else {
  const envContent = fs.readFileSync(envPath, 'utf8');

  // Check for auto-refresh config
  const hasAutoRefresh = ENV_CONFIGS.auto_refresh.every(key => {
    const regex = new RegExp(`^${key}=.+`, 'm');
    return regex.test(envContent);
  });

  // Check for static token config
  const hasStaticToken = ENV_CONFIGS.static_token.every(key => {
    const regex = new RegExp(`^${key}=.+`, 'm');
    return regex.test(envContent);
  });

  if (hasAutoRefresh) {
    console.log('   ✅ Auto-refresh OAuth configured');
    ENV_CONFIGS.auto_refresh.forEach(key => {
      const regex = new RegExp(`^${key}=(.+)`, 'm');
      const match = envContent.match(regex);
      const value = match ? match[1].trim() : '';
      const masked = value ? `${value.substring(0, 10)}...` : '(empty)';
      console.log(`      ${key}: ${masked}`);
    });
  } else if (hasStaticToken) {
    console.log('   ⚠️  Static token configured (expires in 1 hour)');
    console.log('   💡 Consider setting up auto-refresh for production');
  } else {
    console.log('   ⚠️  No OAuth configuration found');
    console.log('   💡 App will use fallback agent (may encounter bot detection)');
  }
}

// Check Git setup
console.log('\n🔧 Git Configuration:');
const gitPath = path.join(process.cwd(), '.git');
if (fs.existsSync(gitPath)) {
  console.log('   ✅ Git repository initialized');

  // Check .gitignore
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    const hasEnvIgnore = gitignoreContent.includes('.env') || gitignoreContent.includes('.env.local');
    console.log(`   ${hasEnvIgnore ? '✅' : '❌'} .env files in .gitignore`);
  } else {
    console.log('   ⚠️  .gitignore not found');
  }
} else {
  console.log('   ⚠️  Git not initialized');
  console.log('   💡 Run: git init');
}

// Summary and recommendations
console.log('\n' + '=' .repeat(60));
console.log('\n📋 Summary and Next Steps:\n');

if (!allFilesExist) {
  console.log('❌ Some required files are missing');
  console.log('   Run: npm install');
} else if (!fs.existsSync(envPath)) {
  console.log('⚠️  Environment not configured');
  console.log('   1. Run: cp .env.example .env.local');
  console.log('   2. Follow: SETUP_GUIDE.md');
} else {
  console.log('✅ Basic setup looks good!');
  console.log('\n📖 Recommended next steps:');
  console.log('   1. npm run dev        - Start development server');
  console.log('   2. npm test           - Run tests');
  console.log('   3. npm run build      - Build for production');
  console.log('\n📚 Documentation:');
  console.log('   - SETUP_GUIDE.md      - Complete setup instructions');
  console.log('   - OAUTH_SETUP.md      - OAuth configuration details');
  console.log('   - TROUBLESHOOTING.md  - Common issues and solutions');
}

console.log('\n' + '=' .repeat(60));
console.log('');
