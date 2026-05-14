const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const args = process.argv.slice(2);

const params = {};
args.forEach(arg => {
    const [key, value] = arg.split('=');
    if (key && value) params[key.toLowerCase()] = value;
});

const username = params.user || 'admin';
const password = params.pass || 'inkopia2026';

let envContent = '';
if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
}

// Update or add ADMIN_USERNAME
if (envContent.includes('ADMIN_USERNAME=')) {
    envContent = envContent.replace(/ADMIN_USERNAME=.*/, `ADMIN_USERNAME=${username}`);
} else {
    envContent += `\nADMIN_USERNAME=${username}`;
}

// Update or add ADMIN_PASSWORD
if (envContent.includes('ADMIN_PASSWORD=')) {
    envContent = envContent.replace(/ADMIN_PASSWORD=.*/, `ADMIN_PASSWORD=${password}`);
} else {
    envContent += `\nADMIN_PASSWORD=${password}`;
}

fs.writeFileSync(envPath, envContent.trim() + '\n');

console.log('✅ Admin credentials updated in server/.env');
console.log(`👤 Username: ${username}`);
console.log(`🔑 Password: ${password}`);
console.log('ℹ️  Please restart your Node.js app in cPanel to apply changes.');
