const mongoose = require('mongoose');
const Partner = require('./src/models/Partner');
const crypto = require('crypto');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';

const partners = [
  {
    partnerId: 'partner_video_001',
    name: 'Website 1 - Video Learning Platform',
    email: 'partner.video@demo.com',
    domain: 'localhost:3002',
    userId: '6902fb27137fbb370d9a8642' // existing user ID from .env
  },
  {
    partnerId: 'partner_quiz_002',
    name: 'Website 2 - Quiz & Assessment Platform',
    email: 'partner.quiz@demo.com',
    domain: 'localhost:3003',
    userId: '6902fb50137fbb370d9a8647' // existing user ID
  },
  {
    partnerId: 'partner_hybrid_003',
    name: 'Website 3 - Hybrid Learning Platform',
    email: 'partner.hybrid@demo.com',
    domain: 'localhost:3004',
    userId: '6902fb5a137fbb370d9a864c' // existing user ID
  }
];

async function createPartners() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');

    console.log('\n=== CREATING/UPDATING PARTNERS ===\n');

    for (const partnerData of partners) {
      // Check if partner exists
      let partner = await Partner.findOne({ partnerId: partnerData.partnerId });
      
      if (partner) {
        console.log(`Partner ${partnerData.partnerId} already exists`);
        // Update if needed
        partner.name = partnerData.name;
        partner.email = partnerData.email;
        partner.domain = partnerData.domain;
        
        if (!partner.apiKey) {
          partner.apiKey = crypto.randomBytes(32).toString('hex');
          partner.apiKeyCreatedAt = new Date();
          console.log(`  Generated new API key: ${partner.apiKey}`);
        } else {
          console.log(`  Existing API key: ${partner.apiKey}`);
        }
        
        await partner.save();
      } else {
        // Create new partner
        partner = new Partner({
          partnerId: partnerData.partnerId,
          name: partnerData.name,
          email: partnerData.email,
          domain: partnerData.domain,
          user: partnerData.userId,
          apiKey: crypto.randomBytes(32).toString('hex'),
          apiKeyCreatedAt: new Date(),
          status: 'active'
        });
        
        await partner.save();
        console.log(`Created partner ${partnerData.partnerId}`);
        console.log(`  API Key: ${partner.apiKey}`);
      }
      console.log('---');
    }

    console.log('\n=== ALL PARTNER API KEYS ===\n');
    const allPartners = await Partner.find({
      partnerId: { $in: partners.map(p => p.partnerId) }
    });
    
    allPartners.forEach(p => {
      console.log(`${p.partnerId}: ${p.apiKey}`);
    });

    await mongoose.connection.close();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createPartners();
