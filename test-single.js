const { MongoClient } = require('mongodb');

// Try connecting to single node directly
const uri = "mongodb://tamanbacaan_admin:Test1234@ac-jz7wvp9-shard-00-01.zvxbiz1.mongodb.net:27017/tamanbacaan?ssl=true&authSource=admin&directConnection=true";

async function testConnection() {
  const client = new MongoClient(uri);
  
  try {
    console.log('🔄 Attempting direct connection to single MongoDB node...');
    await client.connect();
    console.log('✅ Successfully connected!');
    
    const db = client.db('tamanbacaan');
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Codename:', error.codeName);
  } finally {
    await client.close();
  }
}

testConnection();
