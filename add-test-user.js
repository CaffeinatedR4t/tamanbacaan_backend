require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
const User = require('./models/user');

// Force Node.js to use Google DNS and native resolver (same as server.js)
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

async function addTestUser() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB using the same configuration as server.js
    await mongoose.connect(process.env.MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: 'vscode@test.com' }, 
        { nik: '3201234567890123' }
      ] 
    });
    
    if (existingUser) {
      console.log('⚠️  User already exists!');
      console.log('📧 Email:', existingUser.email);
      console.log('🆔 NIK:', existingUser.nik);
      console.log('👤 User ID:', existingUser._id);
      
      // Get total user count
      const userCount = await User.countDocuments();
      console.log('📊 Total users in database:', userCount);
      
      await mongoose.connection.close();
      console.log('🔒 Database connection closed');
      return;
    }

    // Hash the password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash('Password123', 10);

    // Create the test user
    const testUser = new User({
      fullName: 'Test User VSCode',
      nik: '3201234567890123',
      email: 'vscode@test.com',
      password: hashedPassword,
      addressRtRw: '001/002',
      addressKelurahan: 'Kelurahan Test',
      addressKecamatan: 'Kecamatan Test',
      phoneNumber: '081234567890',
      role: 'MEMBER',
      isVerified: true
    });

    // Save the user to the database
    await testUser.save();
    
    console.log('\n✅ Test user created successfully!');
    console.log('═══════════════════════════════════════');
    console.log('User Details:');
    console.log('───────────────────────────────────────');
    console.log('👤 Full Name:', testUser.fullName);
    console.log('🆔 NIK:', testUser.nik);
    console.log('📧 Email:', testUser.email);
    console.log('📞 Phone:', testUser.phoneNumber);
    console.log('🏠 Address:', `${testUser.addressRtRw}, ${testUser.addressKelurahan}, ${testUser.addressKecamatan}`);
    console.log('👥 Role:', testUser.role);
    console.log('✓ Verified:', testUser.isVerified);
    console.log('───────────────────────────────────────');
    console.log('🆔 MongoDB User ID:', testUser._id);
    console.log('───────────────────────────────────────');
    
    // Get total count of users
    const userCount = await User.countDocuments();
    console.log('📊 Total users in database:', userCount);
    console.log('═══════════════════════════════════════');
    
    console.log('\n💡 You can now login with:');
    console.log('   Email: vscode@test.com');
    console.log('   Password: Password123');

  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.code === 11000) {
      console.error('\n⚠️  Duplicate key error - User with this email or NIK already exists');
    }
  } finally {
    // Close the database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔒 Database connection closed');
    }
  }
}

// Run the function
addTestUser();
