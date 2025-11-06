import crypto from 'crypto';

// Generate a secure random JWT secret
const secret = crypto.randomBytes(64).toString('hex');

console.log('\n=== JWT Secret Generator ===\n');
console.log('Copy this secure JWT_SECRET to your .env file:\n');
console.log(`JWT_SECRET=${secret}\n`);
console.log('Replace the current JWT_SECRET value in /backend/.env');
console.log('Then restart your server.\n');
