const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet')
.then(() => console.log('✅ MongoDB connected for seeding'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

const Certificate = require('./src/models/Certificate');
const LearnPass = require('./src/models/LearnPass');
const User = require('./src/models/User');
const Institution = require('./src/models/Institution');

const seedRealData = async () => {
  try {
    console.log('🌱 Starting to seed Certificate & LearnPass data...\n');

    // Get existing users and institutions
    const users = await User.find({ role: 'student' }).limit(5);
    const institutions = await Institution.find().limit(1);

    if (users.length === 0) {
      console.log('❌ No students found in database.');
      console.log('💡 Please create users first or run: node backend/create-user-data.js');
      return;
    }

    if (institutions.length === 0) {
      console.log('❌ No institutions found in database.');
      console.log('💡 Please create institutions first.');
      return;
    }

    const institution = institutions[0];
    console.log(`✅ Using institution: ${institution.name}`);
    console.log(`✅ Found ${users.length} students\n`);

    // ====================  SEED CERTIFICATES ====================
    console.log('📜 Creating Certificates...');
    
    const courses = [
      { 
        name: 'Blockchain Fundamentals', 
        code: 'BLK101', 
        credits: 3, 
        duration: 40,
        description: 'Introduction to blockchain technology, cryptocurrencies, and decentralized systems',
        skills: [
          { name: 'Blockchain', level: 'intermediate', description: 'Understanding of blockchain architecture' },
          { name: 'Cryptography', level: 'beginner', description: 'Basic cryptographic concepts' },
          { name: 'Bitcoin', level: 'intermediate', description: 'Bitcoin protocol and ecosystem' },
          { name: 'Ethereum', level: 'beginner', description: 'Ethereum basics' }
        ],
        category: 'technology',
        level: 'beginner'
      },
      { 
        name: 'Smart Contract Development', 
        code: 'BLK201', 
        credits: 4, 
        duration: 60,
        description: 'Advanced course on developing and deploying smart contracts with Solidity',
        skills: [
          { name: 'Solidity', level: 'advanced', description: 'Smart contract programming' },
          { name: 'Smart Contracts', level: 'advanced', description: 'Design and implementation' },
          { name: 'Ethereum', level: 'intermediate', description: 'Ethereum development' },
          { name: 'Testing', level: 'intermediate', description: 'Smart contract testing' }
        ],
        category: 'technology',
        level: 'intermediate'
      },
      { 
        name: 'DApp Development', 
        code: 'BLK301', 
        credits: 4, 
        duration: 50,
        description: 'Building decentralized applications with React and Web3',
        skills: [
          { name: 'React', level: 'advanced', description: 'React development' },
          { name: 'Web3.js', level: 'intermediate', description: 'Web3 integration' },
          { name: 'Ethers.js', level: 'intermediate', description: 'Ethereum library' },
          { name: 'Frontend', level: 'advanced', description: 'Frontend development' }
        ],
        category: 'technology',
        level: 'advanced'
      }
    ];

    const grades = ['A', 'A+', 'B+'];
    let certCount = 0;

    for (let i = 0; i < Math.min(courses.length, users.length); i++) {
      const course = courses[i];
      const user = users[i];
      const tokenId = 1000 + i;
      const certId = `CERT-2024-${tokenId}`;
      
      // Check if certificate already exists
      const existing = await Certificate.findOne({ certificateId: certId });
      if (existing) {
        console.log(`  ⏭️  Certificate ${certId} already exists`);
        continue;
      }

      try {
        // Generate wallet address if user doesn't have one
        const walletAddress = user.walletAddress || `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`;
        
        const certificate = await Certificate.create({
          tokenId: tokenId,
          certificateId: certId,
          student: user._id,
          studentAddress: walletAddress,
          courseName: course.name,
          courseCode: course.code,
          courseDescription: course.description,
          issuer: institution._id,
          issuerName: institution.name,
          issueDate: new Date(2024, i, 15),
          completionDate: new Date(2024, i, 10),
          gradeOrScore: grades[i],
          credits: course.credits,
          duration: course.duration,
          skillsCovered: course.skills,
          certificateType: 'academic',
          level: course.level,
          category: course.category,
          contractAddress: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
          transactionHash: `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`,
          blockNumber: 12000000 + i * 100,
          tokenURI: `https://eduwallet.edu/certificates/${tokenId}/metadata.json`,
          certificateURI: `https://eduwallet.edu/certificates/${tokenId}.pdf`,
          isVerified: i % 2 === 0, // Verified: first and third
          verifiedAt: i % 2 === 0 ? new Date() : null,
          status: 'active',
          metadata: {
            imageUrl: `https://via.placeholder.com/600x400?text=${encodeURIComponent(course.name)}`,
            pdfUrl: `https://eduwallet.edu/certificates/${tokenId}.pdf`,
            attributes: [
              { trait_type: 'Course', value: course.name },
              { trait_type: 'Grade', value: grades[i] },
              { trait_type: 'Credits', value: course.credits }
            ]
          }
        });
        
        certCount++;
        console.log(`  ✅ Certificate: ${certificate.courseName} - ${user.firstName} ${user.lastName} (${certificate.isVerified ? 'Verified' : 'Pending'})`);
      } catch (error) {
        console.log(`  ❌ Failed to create certificate for ${user.firstName}:`, error.message);
      }
    }

    // ==================== SEED LEARNPASSES ====================
    console.log('\n🎓 Creating LearnPasses...');
    
    const lpData = [
      { completed: 2, total: 4, skills: 6, gpa: 3.75 },
      { completed: 3, total: 5, skills: 8, gpa: 3.90 },
      { completed: 1, total: 3, skills: 4, gpa: 3.50 }
    ];

    const lpStatuses = ['active', 'active', 'active'];
    const verifications = [true, true, false];
    let lpCount = 0;

    for (let i = 0; i < Math.min(lpData.length, users.length); i++) {
      const user = users[i];
      const data = lpData[i];
      const tokenId = 2000 + i;
      const studentId = `STU-${2024}${String(i + 1).padStart(4, '0')}`;
      
      // Check if LearnPass already exists
      const existing = await LearnPass.findOne({ studentId: studentId });
      if (existing) {
        console.log(`  ⏭️  LearnPass ${studentId} already exists`);
        continue;
      }

      try {
        // Create courses array
        const lpCourses = [];
        for (let j = 0; j < data.total; j++) {
          lpCourses.push({
            courseId: `COURSE-${j + 1}`,
            courseName: courses[j % courses.length].name,
            courseCode: courses[j % courses.length].code,
            credits: courses[j % courses.length].credits,
            status: j < data.completed ? 'completed' : 'in-progress',
            grade: j < data.completed ? ['A', 'A+', 'B+'][j % 3] : null,
            completedAt: j < data.completed ? new Date(2024, j, 15) : null
          });
        }

        // Create skills array
        const skillsList = ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Blockchain', 'Solidity', 'Web3', 'Smart Contracts'];
        const acquiredSkills = skillsList.slice(0, data.skills);

        const learnPass = await LearnPass.create({
          tokenId: tokenId,
          owner: user._id,
          studentId: studentId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          institutionId: institution._id,
          profilePictureURI: user.profilePicture || 'https://via.placeholder.com/150',
          tokenURI: `https://eduwallet.edu/learnpass/${tokenId}/metadata.json`,
          contractAddress: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
          transactionHash: `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`,
          blockNumber: 12000500 + i * 100,
          status: lpStatuses[i],
          isVerified: verifications[i],
          verifiedAt: verifications[i] ? new Date() : null,
          courses: lpCourses,
          completedCourses: data.completed,
          totalCourses: data.total,
          acquiredSkills: acquiredSkills,
          totalSkills: skillsList.length,
          gpa: data.gpa,
          totalCredits: data.completed * 3,
          metadata: {
            imageUrl: `https://via.placeholder.com/400x400?text=LearnPass`,
            description: `Academic LearnPass for ${user.firstName} ${user.lastName}`,
            attributes: [
              { trait_type: 'Institution', value: institution.name },
              { trait_type: 'GPA', value: data.gpa },
              { trait_type: 'Courses Completed', value: data.completed }
            ]
          }
        });
        
        lpCount++;
        console.log(`  ✅ LearnPass: ${learnPass.name} - ${learnPass.studentId} (${learnPass.isVerified ? 'Verified' : 'Unverified'}, ${learnPass.status})`);
      } catch (error) {
        console.log(`  ❌ Failed to create LearnPass for ${user.firstName}:`, error.message);
      }
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Certificates created: ${certCount}`);
    console.log(`   - LearnPasses created: ${lpCount}`);
    console.log(`   - Students used: ${users.length}`);
    console.log(`   - Institution: ${institution.name}`);
    
    console.log('\n🔗 Now you can:');
    console.log('   1. Start backend: cd backend && npm start');
    console.log('   2. Start frontend: npm start');
    console.log('   3. Go to: http://localhost:3000/admin/certificates');
    console.log('   4. Go to: http://localhost:3000/admin/learnpasses');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
};

// Run seeding
seedRealData();
