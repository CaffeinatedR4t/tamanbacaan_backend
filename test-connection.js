const { MongoClient } = require('mongodb');

const uri = "mongodb://tamanbacaan_admin:Test1234@ac-jz7wvp9-shard-00-01.zvxbiz1.mongodb.net:27017,ac-jz7wvp9-shard-00-02.zvxbiz1.mongodb.net:27017/tamanbacaan?ssl=true&replicaSet=atlas-7cehex-shard-0&authSource=admin&retryWrites=true&w=majority&directConnection=false";

async function testConnection() {
  const client = new MongoClient(uri);
  
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // List databases
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log('📁 Available databases:');
    dbs.databases.forEach(db => console.log(`  - ${db.name}`));
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
  } finally {
    await client.close();
  }
}

testConnection();
