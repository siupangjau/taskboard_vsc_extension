const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get package version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const version = packageJson.version;

console.log(`Publishing version ${version}...`);

try {
    // Clean up
    console.log('Cleaning up...');
    if (fs.existsSync('extension')) {
        fs.rmSync('extension', { recursive: true, force: true });
    }

    // Install dependencies
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Build
    console.log('Building extension...');
    execSync('npm run compile', { stdio: 'inherit' });

    // Package
    console.log('Packaging extension...');
    execSync('npx @vscode/vsce package', { stdio: 'inherit' });

    // Publish if --publish flag is provided
    if (process.argv.includes('--publish')) {
        console.log('Publishing extension...');
        execSync('npx @vscode/vsce publish', { stdio: 'inherit' });
    }

    console.log('Done!');
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
} 