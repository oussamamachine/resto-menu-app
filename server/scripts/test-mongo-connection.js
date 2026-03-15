const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('❌ MONGO_URI is undefined. Check your .env file path.');
  process.exit(1);
}

console.log('Testing connection to:', uri.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs

async function run() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000, // Fail fast
    connectTimeoutMS: 5000,
  });

  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    const db = client.db();
    const adminDb = db.admin();
    const info = await adminDb.serverStatus();
    console.log('Server version:', info.version);
    console.log('Connection OK.');
  } catch (err) {
    console.error('❌ Connection failed!');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.cause) console.error('Cause:', err.cause);
    
    if (err.message.includes('bad auth')) {
      console.log('\n👉 HINT: Check your username and password in server/.env');
    } else if (err.message.includes('ServerSelectionTimeoutError') || err.message.includes('ETIMEDOUT')) {
      console.log('\n👉 HINT: This is likely an IP Allowlist issue.');
      console.log('   1. Go to Atlas > Security > Network Access');
      console.log('   2. Add IP Address > Allow Access from Anywhere (0.0.0.0/0) for testing');
      console.log('   3. Wait 1-2 minutes and try again.');
    }
  } finally {
    await client.close();
  }
}

run();
