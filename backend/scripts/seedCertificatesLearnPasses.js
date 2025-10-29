/**
 * Seed Certificates and LearnPasses Data
 * Run: node backend/scripts/seedCertificatesLearnPasses.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const Certificate = require('../src/models/Certificate');
const LearnPass = require('../src/models/LearnPass');
const User = require('../src/models/User');
const Institution = require('../src/models/Institution');

// Generate random Ethereum address
const generateAddress = () => {
  return '0x' + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

// Generate random transaction hash
const generateTxHash = () => {
  return '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

// Generate random block number
const generateBlockNumber = () => {
  return Math.floor(Math.random() * 1000000) + 15000000;
};

// Sample certificate data
const certificateTemplates = [
  {
    courseName: "Full Stack Web Development",
    courseCode: "WEB-301",
    courseDescription: "Comprehensive course covering React, Node.js, MongoDB, and modern web development practices",
    gradeOrScore: "A+",
    credits: 6,
    duration: 120,
    certificateType: "completion",
    level: "intermediate",
    category: "technology",
    skillsCovered: [
      { name: "React.js", level: "advanced", description: "Building modern single-page applications" },
      { name: "Node.js", level: "intermediate", description: "Backend development with Express" },
      { name: "MongoDB", level: "intermediate", description: "NoSQL database management" }
    ]
  },
  {
    courseName: "Blockchain Fundamentals",
    courseCode: "BC-101",
    courseDescription: "Introduction to blockchain technology, smart contracts, and decentralized applications",
    gradeOrScore: "A",
    credits: 4,
    duration: 80,
    certificateType: "completion",
    level: "beginner",
    category: "technology",
    skillsCovered: [
      { name: "Solidity", level: "beginner", description: "Smart contract development" },
      { name: "Web3.js", level: "beginner", description: "Blockchain interaction" },
      { name: "Ethereum", level: "intermediate", description: "Ethereum blockchain concepts" }
    ]
  },
  {
    courseName: "Data Science with Python",
    courseCode: "DS-201",
    courseDescription: "Advanced data analysis, machine learning, and visualization using Python",
    gradeOrScore: "A+",
    credits: 5,
    duration: 100,
    certificateType: "achievement",
    level: "advanced",
    category: "science",
    skillsCovered: [
      { name: "Python", level: "advanced", description: "Programming for data science" },
      { name: "Pandas", level: "advanced", description: "Data manipulation" },
      { name: "TensorFlow", level: "intermediate", description: "Machine learning models" }
    ]
  },
  {
    courseName: "UI/UX Design Masterclass",
    courseCode: "DES-401",
    courseDescription: "Professional user interface and experience design principles and practices",
    gradeOrScore: "A",
    credits: 4,
    duration: 90,
    certificateType: "professional",
    level: "professional",
    category: "design",
    skillsCovered: [
      { name: "Figma", level: "expert", description: "Professional design tool" },
      { name: "User Research", level: "advanced", description: "Understanding user needs" },
      { name: "Prototyping", level: "advanced", description: "Interactive mockups" }
    ]
  },
  {
    courseName: "Cloud Computing with AWS",
    courseCode: "CC-301",
    courseDescription: "Amazon Web Services fundamentals, architecture, and best practices",
    gradeOrScore: "B+",
    credits: 5,
    duration: 110,
    certificateType: "professional",
    level: "intermediate",
    category: "technology",
    skillsCovered: [
      { name: "AWS EC2", level: "intermediate", description: "Cloud computing instances" },
      { name: "AWS S3", level: "intermediate", description: "Cloud storage" },
      { name: "AWS Lambda", level: "beginner", description: "Serverless computing" }
    ]
  },
  {
    courseName: "Cybersecurity Essentials",
    courseCode: "SEC-101",
    courseDescription: "Fundamental cybersecurity concepts, threat analysis, and defense strategies",
    gradeOrScore: "A",
    credits: 4,
    duration: 85,
    certificateType: "certification",
    level: "intermediate",
    category: "technology",
    skillsCovered: [
      { name: "Network Security", level: "intermediate", description: "Securing networks" },
      { name: "Encryption", level: "intermediate", description: "Data protection" },
      { name: "Penetration Testing", level: "beginner", description: "Security testing" }
    ]
  },
  {
    courseName: "Mobile App Development",
    courseCode: "MOB-201",
    courseDescription: "Building cross-platform mobile applications with React Native",
    gradeOrScore: "A+",
    credits: 5,
    duration: 95,
    certificateType: "completion",
    level: "intermediate",
    category: "technology",
    skillsCovered: [
      { name: "React Native", level: "advanced", description: "Mobile app framework" },
      { name: "JavaScript", level: "advanced", description: "Programming language" },
      { name: "Redux", level: "intermediate", description: "State management" }
    ]
  },
  {
    courseName: "Digital Marketing Strategy",
    courseCode: "MKT-301",
    courseDescription: "Comprehensive digital marketing including SEO, social media, and analytics",
    gradeOrScore: "A",
    credits: 4,
    duration: 75,
    certificateType: "professional",
    level: "professional",
    category: "marketing",
    skillsCovered: [
      { name: "SEO", level: "advanced", description: "Search engine optimization" },
      { name: "Social Media Marketing", level: "advanced", description: "Platform strategies" },
      { name: "Google Analytics", level: "intermediate", description: "Web analytics" }
    ]
  }
];

// Sample LearnPass data
const learnPassTemplates = [
  {
    studentId: "STU001",
    academicProgress: {
      totalCourses: 12,
      completedCourses: 10,
      totalSkills: 25,
      acquiredSkills: 20,
      gpa: 3.8,
      credits: 48
    },
    badges: [
      { name: "Early Achiever", description: "Completed first course", icon: "🏆", criteria: "Complete first course" },
      { name: "Tech Enthusiast", description: "Completed 5 technology courses", icon: "💻", criteria: "Complete 5 tech courses" }
    ]
  },
  {
    studentId: "STU002",
    academicProgress: {
      totalCourses: 8,
      completedCourses: 6,
      totalSkills: 18,
      acquiredSkills: 15,
      gpa: 3.5,
      credits: 30
    },
    badges: [
      { name: "Quick Learner", description: "Completed course in record time", icon: "⚡", criteria: "Fast completion" }
    ]
  },
  {
    studentId: "STU003",
    academicProgress: {
      totalCourses: 15,
      completedCourses: 13,
      totalSkills: 30,
      acquiredSkills: 28,
      gpa: 3.9,
      credits: 60
    },
    badges: [
      { name: "Honor Student", description: "Maintained high GPA", icon: "🎓", criteria: "GPA above 3.8" },
      { name: "Polymath", description: "Mastered multiple disciplines", icon: "🌟", criteria: "Complete 10+ courses" }
    ]
  },
  {
    studentId: "STU004",
    academicProgress: {
      totalCourses: 6,
      completedCourses: 5,
      totalSkills: 12,
      acquiredSkills: 10,
      gpa: 3.3,
      credits: 24
    },
    badges: [
      { name: "Dedicated Learner", description: "Regular course attendance", icon: "📚", criteria: "Consistent learning" }
    ]
  },
  {
    studentId: "STU005",
    academicProgress: {
      totalCourses: 20,
      completedCourses: 18,
      totalSkills: 40,
      acquiredSkills: 36,
      gpa: 4.0,
      credits: 80
    },
    badges: [
      { name: "Perfect Score", description: "Achieved 4.0 GPA", icon: "💯", criteria: "Perfect GPA" },
      { name: "Master Learner", description: "Completed 15+ courses", icon: "🏅", criteria: "15+ completions" }
    ]
  },
  {
    studentId: "STU006",
    academicProgress: {
      totalCourses: 10,
      completedCourses: 8,
      totalSkills: 22,
      acquiredSkills: 18,
      gpa: 3.6,
      credits: 40
    },
    badges: [
      { name: "Consistent Performer", description: "Steady progress", icon: "📈", criteria: "Regular completion" }
    ]
  },
  {
    studentId: "STU007",
    academicProgress: {
      totalCourses: 14,
      completedCourses: 12,
      totalSkills: 28,
      acquiredSkills: 24,
      gpa: 3.7,
      credits: 56
    },
    badges: [
      { name: "Rising Star", description: "Exceptional improvement", icon: "⭐", criteria: "GPA improvement" },
      { name: "Team Player", description: "Active in group projects", icon: "🤝", criteria: "Collaboration" }
    ]
  },
  {
    studentId: "STU008",
    academicProgress: {
      totalCourses: 9,
      completedCourses: 7,
      totalSkills: 20,
      acquiredSkills: 16,
      gpa: 3.4,
      credits: 35
    },
    badges: [
      { name: "Skill Collector", description: "Diverse skill set", icon: "🎯", criteria: "Multiple skills" }
    ]
  }
];

async function seedData() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create institution
    let institution = await Institution.findOne();
    
    if (!institution) {
      console.log('📝 Creating demo institution...');
      institution = await Institution.create({
        name: 'EduWallet Academy',
        institutionId: 'EDU-ACADEMY-001',
        email: 'admin@eduwallet-academy.edu',
        phone: '+1-555-0100',
        website: 'https://eduwallet-academy.edu',
        type: 'online_platform',
        level: 'professional',
        address: {
          street: '123 Education Street',
          city: 'San Francisco',
          state: 'California',
          country: 'United States',
          postalCode: '94102'
        },
        description: 'Leading online learning platform offering professional courses in technology, business, and design',
        isVerified: true,
        verifiedAt: new Date(),
        isActive: true
      });
      console.log('✅ Institution created');
    }

    // Find or create students
    const students = [];
    for (let i = 0; i < 8; i++) {
      let student = await User.findOne({ email: `student${i + 1}@demo.com` });
      
      if (!student) {
        const birthDate = new Date('2000-01-15');
        birthDate.setFullYear(birthDate.getFullYear() - (18 + i)); // Different ages
        
        student = await User.create({
          username: `student${i + 1}`,
          email: `student${i + 1}@demo.com`,
          password: 'Student123456',
          firstName: `Student`,
          lastName: `${i + 1}`,
          dateOfBirth: birthDate,
          role: 'student',
          walletAddress: generateAddress(),
          isEmailVerified: true,
          isActive: true
        });
      }
      students.push(student);
    }
    console.log(`✅ ${students.length} students ready`);

    // Clear existing data
    const deleteCerts = await Certificate.deleteMany({});
    const deleteLearnPasses = await LearnPass.deleteMany({});
    console.log(`🗑️  Deleted ${deleteCerts.deletedCount} certificates`);
    console.log(`🗑️  Deleted ${deleteLearnPasses.deletedCount} learn passes`);

    // Create Certificates
    const certificates = [];
    const contractAddress = generateAddress();
    
    for (let i = 0; i < 8; i++) {
      const template = certificateTemplates[i];
      const student = students[i];
      
      // Random dates
      const completionDate = new Date();
      completionDate.setDate(completionDate.getDate() - Math.floor(Math.random() * 90));
      
      const issueDate = new Date(completionDate);
      issueDate.setDate(issueDate.getDate() + Math.floor(Math.random() * 7));
      
      const certificate = await Certificate.create({
        tokenId: i + 1,
        certificateId: `CERT-${institution.institutionId}-${String(i + 1).padStart(4, '0')}`,
        student: student._id,
        studentAddress: student.walletAddress,
        courseName: template.courseName,
        courseCode: template.courseCode,
        courseDescription: template.courseDescription,
        issuer: institution._id,
        issuerName: institution.name,
        issueDate: issueDate,
        completionDate: completionDate,
        gradeOrScore: template.gradeOrScore,
        credits: template.credits,
        duration: template.duration,
        skillsCovered: template.skillsCovered,
        certificateType: template.certificateType,
        level: template.level,
        category: template.category,
        contractAddress: contractAddress,
        transactionHash: generateTxHash(),
        blockNumber: generateBlockNumber(),
        tokenURI: `ipfs://QmCert${i + 1}${generateAddress().slice(2, 12)}`,
        certificateURI: `ipfs://QmCertDoc${i + 1}${generateAddress().slice(2, 12)}`,
        isVerified: i < 6, // First 6 are verified
        verifiedAt: i < 6 ? issueDate : null,
        status: 'active'
      });
      
      certificates.push(certificate);
    }
    
    console.log(`\n✅ Created ${certificates.length} certificates`);

    // Create LearnPasses
    const learnPasses = [];
    const learnPassContractAddress = generateAddress();
    
    for (let i = 0; i < 8; i++) {
      const template = learnPassTemplates[i];
      const student = students[i];
      
      const learnPass = await LearnPass.create({
        tokenId: i + 1,
        owner: student._id,
        studentId: template.studentId,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        institutionId: institution._id,
        profilePictureURI: `ipfs://QmProfile${i + 1}${generateAddress().slice(2, 12)}`,
        coursesCompletedURI: `ipfs://QmCourses${i + 1}${generateAddress().slice(2, 12)}`,
        skillsAcquiredURI: `ipfs://QmSkills${i + 1}${generateAddress().slice(2, 12)}`,
        tokenURI: `ipfs://QmLearnPass${i + 1}${generateAddress().slice(2, 12)}`,
        contractAddress: learnPassContractAddress,
        transactionHash: generateTxHash(),
        blockNumber: generateBlockNumber(),
        status: 'active',
        isVerified: i < 5, // First 5 are verified
        verifiedAt: i < 5 ? new Date() : null,
        academicProgress: template.academicProgress,
        certificates: [certificates[i]._id], // Link to corresponding certificate
        badges: template.badges,
        rewards: [
          {
            type: 'edu_token',
            amount: template.academicProgress.credits * 10,
            description: 'Academic achievement rewards',
            awardedAt: new Date()
          }
        ]
      });
      
      learnPasses.push(learnPass);
    }
    
    console.log(`✅ Created ${learnPasses.length} learn passes`);

    // Display summary
    console.log('\n📊 Summary:');
    console.log('═'.repeat(60));
    
    console.log('\n📜 CERTIFICATES:');
    certificates.slice(0, 3).forEach((cert, idx) => {
      console.log(`\n${idx + 1}. ${cert.courseName} (${cert.courseCode})`);
      console.log(`   Student: ${students[idx].email}`);
      console.log(`   Grade: ${cert.gradeOrScore}`);
      console.log(`   Token ID: ${cert.tokenId}`);
      console.log(`   Status: ${cert.status} | Verified: ${cert.isVerified}`);
    });
    console.log(`\n... and ${certificates.length - 3} more certificates`);

    console.log('\n\n🎓 LEARNPASSES:');
    learnPasses.slice(0, 3).forEach((lp, idx) => {
      console.log(`\n${idx + 1}. ${lp.name} (${lp.studentId})`);
      console.log(`   Email: ${lp.email}`);
      console.log(`   GPA: ${lp.academicProgress.gpa}`);
      console.log(`   Courses: ${lp.academicProgress.completedCourses}/${lp.academicProgress.totalCourses}`);
      console.log(`   Badges: ${lp.badges.length}`);
      console.log(`   Status: ${lp.status} | Verified: ${lp.isVerified}`);
    });
    console.log(`\n... and ${learnPasses.length - 3} more learn passes`);

    console.log('\n\n🎉 Seed completed successfully!');
    console.log('\n🌐 View in admin panel:');
    console.log('   Certificates: http://localhost:3000/admin/certificates');
    console.log('   LearnPasses:  http://localhost:3000/admin/learnpasses');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  seedData()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = seedData;
