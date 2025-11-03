const mongoose = require('mongoose');
const Partner = require('./src/models/Partner');
const User = require('./src/models/User');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';

async function checkPartners() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check all 3 partner websites
    const partnerEmails = [
      'partner1@example.com',  // Web1 - Video
      'partner2@example.com',  // Web2 - Quiz
      'partner3@example.com'   // Web3 - Hybrid
    ];

    console.log('📊 Partner Information:\n');
    
    for (const email of partnerEmails) {
      const user = await User.findOne({ email });
      if (!user) {
        console.log(`❌ User not found: ${email}\n`);
        continue;
      }

      const partner = await Partner.findOne({ user: user._id });
      
      console.log(`🏢 ${email}`);
      console.log(`   User ID: ${user._id}`);
      console.log(`   Partner ID: ${partner ? partner._id : '❌ NOT FOUND'}`);
      console.log(`   API Key: ${partner ? partner.apiKey.substring(0, 20) + '...' : 'N/A'}`);
      console.log(`   Status: ${partner ? '✅ Partner record exists' : '❌ No Partner record'}`);
      console.log('');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPartners();
