const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/eduwallet');
    console.log('✅ Connected to MongoDB\n');

    // Check admin@example.com
    const admin = await User.findOne({ email: 'admin@example.com' }).select('+password');
    
    if (admin) {
      console.log('✅ Admin user found with email: admin@example.com');
      console.log('═══════════════════════════════════════');
      console.log('  Username:', admin.username);
      console.log('  Email:', admin.email);
      console.log('  Role:', admin.role);
      console.log('  isActive:', admin.isActive);
      console.log('  status:', admin.status);
      console.log('═══════════════════════════════════════\n');

      // Test password
      const testPassword = 'Admin123456';
      const isMatch = await bcrypt.compare(testPassword, admin.password);
      
      console.log(`🔑 Testing password: "${testPassword}"`);
      console.log(`   Result: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}\n`);

      if (!isMatch) {
        console.log('⚠️  Password does NOT match!');
        console.log('   Trying other common passwords...\n');
        
        const commonPasswords = ['admin', 'admin123', 'Admin123', 'password', '123456'];
        for (const pwd of commonPasswords) {
          const match = await bcrypt.compare(pwd, admin.password);
          if (match) {
            console.log(`   ✅ Password matches: "${pwd}"`);
            break;
          }
        }
      }
    } else {
      console.log('❌ No admin user found with email: admin@example.com\n');
      
      // Check old email
      const oldAdmin = await User.findOne({ email: 'admin@gmail.com' }).select('+password');
      if (oldAdmin) {
        console.log('⚠️  Found admin with email: admin@gmail.com');
        console.log('═══════════════════════════════════════');
        console.log('  Username:', oldAdmin.username);
        console.log('  Email:', oldAdmin.email);
        console.log('  Role:', oldAdmin.role);
        console.log('═══════════════════════════════════════\n');
      }

      // Check by username
      const adminByUsername = await User.findOne({ username: 'admin' }).select('+password');
      if (adminByUsername) {
        console.log('✅ Found admin by username:');
        console.log('═══════════════════════════════════════');
        console.log('  Username:', adminByUsername.username);
        console.log('  Email:', adminByUsername.email);
        console.log('  Role:', adminByUsername.role);
        console.log('  isActive:', adminByUsername.isActive);
        console.log('  status:', adminByUsername.status);
        console.log('═══════════════════════════════════════\n');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdmin();
