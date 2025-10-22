const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function resetAdminPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/eduwallet');
    console.log('✅ Connected to MongoDB\n');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found with email: admin@example.com');
      process.exit(1);
    }

    console.log('📋 Current admin info:');
    console.log('  Username:', admin.username);
    console.log('  Email:', admin.email);
    console.log('  Role:', admin.role);
    console.log('  isActive:', admin.isActive);
    console.log();

    // Hash new password directly
    const newPassword = 'Admin123456';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    console.log('🔄 Updating password...');
    
    // Update using updateOne to bypass pre-save hook
    await User.updateOne(
      { email: 'admin@example.com' },
      { 
        $set: { 
          password: hashedPassword,
          isActive: true,
          status: 'active'
        } 
      }
    );

    console.log('✅ Password updated successfully!\n');

    // Verify the update
    const updatedAdmin = await User.findOne({ email: 'admin@example.com' }).select('+password');
    const isMatch = await bcrypt.compare(newPassword, updatedAdmin.password);

    console.log('🔍 Verification:');
    console.log('  Password matches "Admin123456":', isMatch ? '✅ YES' : '❌ NO');
    console.log();

    if (isMatch) {
      console.log('═══════════════════════════════════════');
      console.log('  ✅ SUCCESS! Admin credentials updated');
      console.log('═══════════════════════════════════════');
      console.log('  📧 Email:    admin@example.com');
      console.log('  🔑 Password: Admin123456');
      console.log('  👑 Role:     super_admin');
      console.log('  ✅ Active:   true');
      console.log('═══════════════════════════════════════');
      console.log();
      console.log('🚀 You can now login at: http://localhost:3000/admin/login');
    } else {
      console.log('❌ Verification failed! Password still does not match.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
