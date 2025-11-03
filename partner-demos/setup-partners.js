/**
 * Script to create 3 partner accounts for demo websites
 * Each partner will have their own courses and students
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

// Partner configurations
const partners = [
  {
    name: 'Website 1 - Video Learning Platform',
    username: 'partner_video_001',
    email: 'partner.video@demo.com',
    password: 'Partner123!@#',
    firstName: 'Video',
    lastName: 'Platform',
    port: 3002,
    domain: 'localhost:3002'
  },
  {
    name: 'Website 2 - Interactive Quiz Platform',
    username: 'partner_quiz_002',
    email: 'partner.quiz@demo.com',
    password: 'Partner123!@#',
    firstName: 'Quiz',
    lastName: 'Platform',
    port: 3003,
    domain: 'localhost:3003'
  },
  {
    name: 'Website 3 - Hybrid Learning Platform',
    username: 'partner_hybrid_003',
    email: 'partner.hybrid@demo.com',
    password: 'Partner123!@#',
    firstName: 'Hybrid',
    lastName: 'Platform',
    port: 3004,
    domain: 'localhost:3004'
  }
];

async function createPartnerAccount(partnerData) {
  try {
    console.log(`\n🔄 Creating partner: ${partnerData.name}...`);
    
    // 1. Register user
    const registerResponse = await axios.post(
      `${BACKEND_URL}/api/auth/register`,
      {
        username: partnerData.username,
        email: partnerData.email,
        password: partnerData.password,
        firstName: partnerData.firstName,
        lastName: partnerData.lastName,
        dateOfBirth: '1990-01-01',
        role: 'partner'
      }
    );
    
    if (registerResponse.data.success) {
      console.log(`✅ Partner account created: ${partnerData.username}`);
      console.log(`   Email: ${partnerData.email}`);
    }
    
    // 2. Login to get token
    const loginResponse = await axios.post(
      `${BACKEND_URL}/api/auth/login`,
      {
        email: partnerData.email,
        password: partnerData.password
      }
    );
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.data.accessToken;
      const userId = loginResponse.data.data.user._id;
      
      console.log(`✅ Login successful`);
      console.log(`   User ID: ${userId}`);
      console.log(`   Token: ${token.substring(0, 20)}...`);
      
      return {
        ...partnerData,
        userId,
        token
      };
    }
    
  } catch (error) {
    if (error.response && (error.response.status === 400 || error.response.status === 409 || error.response.data.message?.includes('already exists'))) {
      console.log(`ℹ️  Partner already exists: ${partnerData.username}`);
      
      // Try to login
      try {
        const loginResponse = await axios.post(
          `${BACKEND_URL}/api/auth/login`,
          {
            email: partnerData.email,
            password: partnerData.password
          }
        );
        
        if (loginResponse.data.success) {
          const token = loginResponse.data.data.accessToken;
          const userId = loginResponse.data.data.user._id;
          
          console.log(`✅ Login successful (existing account)`);
          console.log(`   User ID: ${userId}`);
          console.log(`   Token: ${token.substring(0, 20)}...`);
          
          return {
            ...partnerData,
            userId,
            token
          };
        }
      } catch (loginError) {
        console.error(`❌ Login failed:`, loginError.response?.data || loginError.message);
      }
    } else {
      console.error(`❌ Error:`, error.response?.data || error.message);
    }
    return null;
  }
}

async function createSampleCourses(partner) {
  try {
    console.log(`\n📚 Creating sample courses for ${partner.name}...`);
    
    const courses = [
      {
        title: `${partner.firstName} Course 1`,
        description: `First course from ${partner.name}`,
        link: `${partner.firstName.toLowerCase()}-course-1`,
        priceEdu: 50
      },
      {
        title: `${partner.firstName} Course 2`,
        description: `Second course from ${partner.name}`,
        link: `${partner.firstName.toLowerCase()}-course-2`,
        priceEdu: 75
      }
    ];
    
    const createdCourses = [];
    
    for (const courseData of courses) {
      const response = await axios.post(
        `${BACKEND_URL}/api/partner/courses`,
        courseData,
        {
          headers: {
            'Authorization': `Bearer ${partner.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        console.log(`✅ Created course: ${courseData.title}`);
        createdCourses.push(response.data.data.course);
      }
    }
    
    return createdCourses;
    
  } catch (error) {
    console.error(`❌ Error creating courses:`, error.response?.data || error.message);
    return [];
  }
}

async function generateEnvFile(partner, courses) {
  const fs = require('fs');
  const path = require('path');
  
  const envContent = `# Partner Configuration
PORT=${partner.port}
PARTNER_ID=${partner.username}
PARTNER_NAME=${partner.name}
PARTNER_EMAIL=${partner.email}
PARTNER_DOMAIN=${partner.domain}

# Authentication
PARTNER_USER_ID=${partner.userId}
PARTNER_JWT_TOKEN=${partner.token}

# Backend Connection
BACKEND_URL=http://localhost:3001

# Sample Course IDs (created by this script)
${courses.map((course, index) => `COURSE_${index + 1}_ID=${course._id}`).join('\n')}
`;

  const websitePath = path.join(__dirname, `website-${partner.port - 3001}-${partner.firstName.toLowerCase()}`);
  const envPath = path.join(websitePath, '.env');
  
  // Create directory if not exists
  if (!fs.existsSync(websitePath)) {
    fs.mkdirSync(websitePath, { recursive: true });
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Generated .env file: ${envPath}`);
  
  return envPath;
}

async function main() {
  console.log('🚀 Creating 3 Partner Accounts for Demo Websites\n');
  console.log('=' .repeat(60));
  
  const createdPartners = [];
  
  for (const partnerData of partners) {
    const partner = await createPartnerAccount(partnerData);
    if (partner) {
      createdPartners.push(partner);
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Created ${createdPartners.length} partner accounts\n`);
  
  // Create sample courses for each partner
  for (const partner of createdPartners) {
    const courses = await createSampleCourses(partner);
    if (courses.length > 0) {
      await generateEnvFile(partner, courses);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY\n');
  
  for (const partner of createdPartners) {
    console.log(`Partner ${partner.port - 3001}:`);
    console.log(`  Name: ${partner.name}`);
    console.log(`  Username: ${partner.username}`);
    console.log(`  Email: ${partner.email}`);
    console.log(`  Port: ${partner.port}`);
    console.log(`  User ID: ${partner.userId}`);
    console.log(`  Token: ${partner.token.substring(0, 30)}...`);
    console.log('');
  }
  
  console.log('='.repeat(60));
  console.log('\n✅ Setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Copy the .env files to each website directory');
  console.log('2. Update each website\'s index.html to use JWT token from .env');
  console.log('3. Start the websites:');
  console.log('   - Website 1: cd partner-demos/website-1-video && npm start');
  console.log('   - Website 2: cd partner-demos/website-2-quiz && npm start');
  console.log('   - Website 3: cd partner-demos/website-3-hybrid && npm start');
}

main().catch(console.error);
