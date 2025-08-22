#!/usr/bin/env node

// Version Migration Script for HDRA.js
// This script helps migrate from v1.x to v2.0

const fs = require('fs');
const path = require('path');

console.log('🔄 HDRA.js Version Migration Tool');
console.log('==================================\n');

// Update package.json version
function updatePackageVersion() {
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        if (packageJson.dependencies && packageJson.dependencies.hdrajs) {
            packageJson.dependencies.hdrajs = '^2.0.0';
            fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
            console.log('✅ Updated package.json to HDRA.js v2.0.0');
        }
    }
}

// Migration guide
function showMigrationGuide() {
    console.log('\n📋 Migration Guide from v1.x to v2.0:');
    console.log('=====================================\n');
    
    console.log('1. 🔄 Import Changes:');
    console.log('   - ValidationPipe → ValidationPipeV2');
    console.log('   - Injectable → InjectableV2 (for new DI features)');
    
    console.log('\n2. 🆕 New Features Available:');
    console.log('   - Enhanced Dependency Injection with scopes');
    console.log('   - Built-in validation decorators');
    console.log('   - Middleware system');
    console.log('   - Interceptors for cross-cutting concerns');
    console.log('   - CLI tools for code generation');
    
    console.log('\n3. 📝 Example Migration:');
    console.log('   Old v1.x code:');
    console.log(`   @Injectable()
   export class UserService {}`);
    
    console.log('\n   New v2.0 code (optional):');
    console.log(`   @Injectable({ scope: Scope.REQUEST })
   export class UserService {}`);
    
    console.log('\n4. 🔧 New Configuration Options:');
    console.log(`   const app = createApp(AppModule, {
     globalPrefix: '/api/v2',
     cors: { origin: true, credentials: true },
     middleware: [LoggerMiddleware.create()],
     globalPipes: [ValidationPipeV2]
   });`);
    
    console.log('\n5. 🛠️ CLI Usage:');
    console.log('   npx hdra generate:controller user');
    console.log('   npx hdra generate:service user');
    console.log('   npx hdra generate:module user');
    
    console.log('\n✨ Your existing v1.x code will continue to work without changes!');
    console.log('   New features are opt-in and backward compatible.\n');
}

// Check current version
function checkCurrentVersion() {
    const packagePath = path.join(__dirname, '..', 'package.json');
    if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        console.log(`📦 Current HDRA.js Version: ${packageJson.version}`);
        
        if (packageJson.version.startsWith('2.')) {
            console.log('✅ You are running HDRA.js v2.0 with enhanced features!');
        } else {
            console.log('⚠️  You are running an older version. Consider upgrading to v2.0.');
        }
    }
}

// Main execution
if (require.main === module) {
    checkCurrentVersion();
    updatePackageVersion();
    showMigrationGuide();
}
