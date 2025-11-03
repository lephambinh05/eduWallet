const mongoose = require('mongoose');
const User = require('./src/models/User');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';

async function listPartnerUsers() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all partner users (email contains 'partner')
    const users = await User.find({ email: /partner/i });
    console.log(`📊 Found ${users.length} partner users:\n`);
    users.forEach((u, i) => {
      console.log(`${i+1}. ${u.name || u.username || 'N/A'} | Email: ${u.email}`);
      console.log(`   User ID: ${u._id}`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listPartnerUsers();
