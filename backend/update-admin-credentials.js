const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const updateAdminPassword = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/eduwallet');
    console.log('✅ Connected to MongoDB\n');

    // Find admin user
    const admin = await User.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('📋 Current admin info:');
    console.log('  Username:', admin.username);
    console.log('  Email:', admin.email);
    console.log('  Role:', admin.role);
    console.log('');

    // Hash new password
    const newPassword = 'Admin123456';
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update admin
    admin.password = hashedPassword;
    admin.email = 'admin@example.com'; // Also update email
    admin.isActive = true;
    admin.status = 'active';
    
    await admin.save();

    console.log('✅ Admin user updated successfully!');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('  📧 Email: admin@example.com');
    console.log('  🔑 Password: Admin123456');
    console.log('  👑 Role: super_admin');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('🚀 You can now login at: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

updateAdminPassword();
