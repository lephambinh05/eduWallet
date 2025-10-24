require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet');
    console.log('✅ Connected to MongoDB');
    
    const count = await User.countDocuments();
    console.log('\n📊 Total users in database:', count);
    
    if (count > 0) {
      const users = await User.find()
        .select('username email firstName lastName role isActive createdAt')
        .limit(10);
      
      console.log('\n👥 Sample users:');
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.username || 'N/A'}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Created: ${user.createdAt}`);
      });
      
      // Count by role
      const studentCount = await User.countDocuments({ role: 'student' });
      const adminCount = await User.countDocuments({ role: { $in: ['admin', 'super_admin'] } });
      const institutionCount = await User.countDocuments({ role: 'institution' });
      
      console.log('\n📈 Users by role:');
      console.log(`   Students: ${studentCount}`);
      console.log(`   Admins: ${adminCount}`);
      console.log(`   Institutions: ${institutionCount}`);
    } else {
      console.log('\n⚠️  No users found in database!');
      console.log('   You need to create some test users first.');
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
