const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected for seeding'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

const Certificate = require('./src/models/Certificate');
const LearnPass = require('./src/models/LearnPass');
const User = require('./src/models/User');
const Institution = require('./src/models/Institution');

const seedData = async () => {
  try {
    console.log('🌱 Starting to seed Certificate & LearnPass data...\n');

    // Get or create admin user for institution creation
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.findOne({ role: 'super_admin' });
    }
    if (!admin) {
      // Create a temporary admin for seeding
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@eduwallet.com',
        username: 'admin',
        password: 'Admin123!',
        walletAddress: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
        role: 'admin',
        emailVerified: true
      });
      console.log('✅ Created admin user for seeding');
    }

    // Get or create institution
    let institution = await Institution.findOne({ name: 'EduWallet University' });
    if (!institution) {
      institution = await Institution.create({
        name: 'EduWallet University',
        institutionId: 'EDU-2024-001',
        description: 'Leading institution in blockchain education',
        website: 'https://eduwallet.edu',
        email: 'contact@eduwallet.edu',
        phone: '+1234567890',
        address: {
          street: '123 Blockchain Street',
          city: 'Web3 City',
          state: 'California',
          country: 'United States',
          postalCode: '12345'
        },
        type: 'university',
        level: 'undergraduate',
        logo: 'https://via.placeholder.com/150',
        isVerified: true,
        verifiedAt: new Date(),
        createdBy: admin._id
      });
      console.log('✅ Created institution: EduWallet University');
    }

    // Get or create students
    const studentEmails = [
      'student1@example.com',
      'student2@example.com',
      'student3@example.com',
      'student4@example.com',
      'student5@example.com'
    ];

    const students = [];
    for (let i = 0; i < studentEmails.length; i++) {
      let student = await User.findOne({ email: studentEmails[i] });
      if (!student) {
        student = await User.create({
          name: `Student ${i + 1}`,
          email: studentEmails[i],
          username: `student${i + 1}`,
          password: 'Password123!',
          walletAddress: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
          role: 'student',
          emailVerified: true
        });
        console.log(`✅ Created student: ${student.name}`);
      }
      students.push(student);
    }

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Certificate.deleteMany({});
    // await LearnPass.deleteMany({});
    // console.log('🗑️  Cleared existing certificates and learnpasses');

    // Seed Certificates
    const courses = [
      { name: 'Blockchain Fundamentals', code: 'BLK101', credits: 3, duration: 40 },
      { name: 'Smart Contract Development', code: 'BLK201', credits: 4, duration: 60 },
      { name: 'DApp Development', code: 'BLK301', credits: 4, duration: 50 },
      { name: 'Web3 Security', code: 'BLK401', credits: 3, duration: 45 },
      { name: 'NFT & Digital Assets', code: 'BLK202', credits: 3, duration: 35 }
    ];

    const skills = [
      ['Blockchain', 'Cryptography', 'Bitcoin', 'Ethereum'],
      ['Solidity', 'Smart Contracts', 'Ethereum', 'Testing'],
      ['React', 'Web3.js', 'Ethers.js', 'Frontend'],
      ['Security', 'Auditing', 'Best Practices', 'Penetration Testing'],
      ['NFTs', 'ERC-721', 'ERC-1155', 'Digital Art']
    ];

    const statuses = ['verified', 'pending', 'verified', 'verified', 'pending'];
    const grades = ['A', 'A+', 'B+', 'A', 'B'];

    console.log('\n📜 Creating Certificates...');
    const certificates = [];
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const student = students[i % students.length];
      
      // Check if certificate already exists
      const existingCert = await Certificate.findOne({ 
        certificateId: `CERT-2024-${1000 + i}` 
      });
      
      if (!existingCert) {
        const certificate = await Certificate.create({
          tokenId: 1000 + i,
          certificateId: `CERT-2024-${1000 + i}`,
          student: student._id,
          studentAddress: student.walletAddress,
          courseName: course.name,
          courseCode: course.code,
          courseDescription: `Comprehensive course covering ${course.name}`,
          issuer: institution._id,
          issuerName: institution.name,
          issueDate: new Date(2024, 0, 15 + i * 7),
          completionDate: new Date(2024, 0, 10 + i * 7),
          gradeOrScore: grades[i],
          creditsEarned: course.credits,
          duration: course.duration,
          skillsCovered: skills[i],
          status: statuses[i],
          contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          transactionHash: `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`,
          blockNumber: 12000000 + i * 100,
          metadata: {
            imageUrl: 'https://via.placeholder.com/600x400?text=Certificate',
            pdfUrl: `https://eduwallet.edu/certificates/${1000 + i}.pdf`
          },
          verifiedAt: statuses[i] === 'verified' ? new Date() : undefined
        });
        certificates.push(certificate);
        console.log(`  ✅ Certificate: ${certificate.courseName} - ${student.name} (${certificate.status})`);
      } else {
        console.log(`  ⏭️  Certificate ${existingCert.certificateId} already exists`);
      }
    }

    // Seed LearnPasses
    console.log('\n🎓 Creating LearnPasses...');
    const learnPasses = [];
    
    const coursesData = [
      { completed: 3, total: 5, skills: 8, totalSkills: 12, gpa: 3.75 },
      { completed: 5, total: 6, skills: 12, totalSkills: 15, gpa: 3.90 },
      { completed: 2, total: 4, skills: 5, totalSkills: 10, gpa: 3.50 },
      { completed: 4, total: 5, skills: 10, totalSkills: 12, gpa: 3.85 },
      { completed: 1, total: 3, skills: 3, totalSkills: 8, gpa: 3.60 }
    ];

    const learnPassStatuses = ['active', 'active', 'suspended', 'active', 'active'];
    const verifications = [true, true, false, true, false];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const data = coursesData[i];
      
      // Check if LearnPass already exists
      const existingLP = await LearnPass.findOne({ 
        studentId: `STU-${2024}${String(i + 1).padStart(4, '0')}` 
      });
      
      if (!existingLP) {
        // Create courses array
        const courses = [];
        for (let j = 0; j < data.total; j++) {
          courses.push({
            courseId: `COURSE-${j + 1}`,
            courseName: `Course ${j + 1}`,
            courseCode: `CS${100 + j}`,
            credits: 3,
            status: j < data.completed ? 'completed' : 'in-progress',
            grade: j < data.completed ? ['A', 'A+', 'B+', 'A'][j % 4] : null,
            completedAt: j < data.completed ? new Date(2024, j, 15) : null
          });
        }

        // Create skills array
        const skillsList = ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Blockchain', 'Solidity', 'Web3', 'Smart Contracts', 'DApp Development', 'NFTs', 'Security', 'Testing'];
        const acquiredSkills = skillsList.slice(0, data.skills);

        const learnPass = await LearnPass.create({
          tokenId: 2000 + i,
          owner: student._id,
          studentId: `STU-${2024}${String(i + 1).padStart(4, '0')}`,
          name: student.name,
          email: student.email,
          institutionId: institution._id,
          profilePictureURI: 'https://via.placeholder.com/150',
          tokenURI: `https://eduwallet.edu/learnpass/${2000 + i}`,
          contractAddress: '0x123d35Cc6634C0532925a3b844Bc9e7595f0aEa',
          transactionHash: `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`,
          blockNumber: 12000500 + i * 100,
          status: learnPassStatuses[i],
          isVerified: verifications[i],
          verifiedAt: verifications[i] ? new Date() : undefined,
          courses: courses,
          completedCourses: data.completed,
          totalCourses: data.total,
          acquiredSkills: acquiredSkills,
          totalSkills: data.totalSkills,
          gpa: data.gpa,
          totalCredits: data.completed * 3,
          metadata: {
            imageUrl: 'https://via.placeholder.com/400x400?text=LearnPass',
            description: `Academic LearnPass for ${student.name}`
          }
        });
        learnPasses.push(learnPass);
        console.log(`  ✅ LearnPass: ${learnPass.name} - ${learnPass.studentId} (${learnPass.status}, verified: ${learnPass.isVerified})`);
      } else {
        console.log(`  ⏭️  LearnPass ${existingLP.studentId} already exists`);
      }
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Certificates: ${certificates.length} new`);
    console.log(`   - LearnPasses: ${learnPasses.length} new`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Institution: ${institution.name}`);
    
    console.log('\n🔗 Test URLs:');
    console.log('   - Admin Certificates: http://localhost:3000/admin/certificates');
    console.log('   - Admin LearnPasses: http://localhost:3000/admin/learnpasses');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
};

// Run seeding
seedData();
