import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

console.log('\n🔍 ResQ Backend Configuration Validator\n');
console.log('═'.repeat(50));

// Check required environment variables
const requiredEnvVars = [
  'PORT',
  'MONGODB_URI',
  'CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'CLIENT_URL'
];

let allEnvVarsPresent = true;

console.log('\n📋 Environment Variables Check:\n');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    const displayValue = varName.includes('SECRET') || varName.includes('URI')
      ? value.substring(0, 20) + '...'
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allEnvVarsPresent = false;
  }
});

if (!allEnvVarsPresent) {
  console.log('\n⚠️  Some environment variables are missing!');
  console.log('Please check your .env file and add the missing variables.\n');
  process.exit(1);
}

// Validate Clerk keys format
console.log('\n🔑 Clerk Keys Validation:\n');
const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;
const secretKey = process.env.CLERK_SECRET_KEY;

if (publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_')) {
  console.log('✅ Clerk Publishable Key format is correct');
} else {
  console.log('❌ Clerk Publishable Key format is incorrect');
  console.log('   Should start with pk_test_ or pk_live_');
}

if (secretKey.startsWith('sk_test_') || secretKey.startsWith('sk_live_')) {
  console.log('✅ Clerk Secret Key format is correct');
} else {
  console.log('❌ Clerk Secret Key format is incorrect');
  console.log('   Should start with sk_test_ or sk_live_');
}

// Test MongoDB connection
console.log('\n🗄️  MongoDB Connection Test:\n');

async function testMongoConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Successfully connected to MongoDB');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    
    // Test database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   Collections: ${collections.length} found`);
    
    await mongoose.disconnect();
    console.log('✅ MongoDB connection test passed');
    
  } catch (error) {
    console.log('❌ Failed to connect to MongoDB');
    console.log(`   Error: ${error.message}`);
    console.log('\n💡 Troubleshooting:');
    console.log('   - Check if MongoDB is running (for local)');
    console.log('   - Verify connection string format');
    console.log('   - For Atlas: Check IP whitelist and credentials');
  }
}

// Run validation
(async () => {
  await testMongoConnection();
  
  console.log('\n' + '═'.repeat(50));
  console.log('\n✨ Configuration validation complete!\n');
  
  if (allEnvVarsPresent) {
    console.log('✅ Your backend is ready to start!');
    console.log('   Run: npm run dev\n');
  } else {
    console.log('⚠️  Please fix the issues above before starting the server.\n');
  }
})();
