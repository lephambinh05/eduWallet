const mongoose = require('mongoose');
const Partner = require('./src/models/Partner');
const User = require('./src/models/User');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';

async function findAllPartners() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all partners
    const partners = await Partner.find({}).populate('ownerUserId');
    
    console.log(`📊 Found ${partners.length} Partners:\n`);
    
    for (let i = 0; i < partners.length; i++) {
      const p = partners[i];
      const user = p.ownerUserId;
      console.log(`${i+1}. Partner ID: ${p._id}`);
      if (user) {
        console.log(`   User ID: ${user._id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name || p.name}`);
      } else {
        console.log(`   ⚠️  No ownerUserId (orphaned partner)`);
        console.log(`   Name: ${p.name}`);
      }
      console.log(`   API Key: ${p.apiKey.substring(0, 30)}...`);
      console.log(`   Domain: ${p.domain || 'N/A'}`);
      console.log('');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

findAllPartners();
