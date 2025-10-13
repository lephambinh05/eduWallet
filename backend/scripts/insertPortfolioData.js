const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Certificate = require('../src/models/Certificate');
const Badge = require('../src/models/Badge');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function insertPortfolioData() {
  try {
    console.log('🚀 Starting portfolio data insertion...');

    // Find user by email
    const user = await User.findOne({ email: 'lephambinh05@gmail.com' });
    if (!user) {
      console.log('❌ User lephambinh05@gmail.com not found');
      return;
    }

    console.log('✅ User found:', user.email, 'ID:', user._id);

    // Clear existing data
    await Course.deleteMany({ userId: user._id });
    await Certificate.deleteMany({ userId: user._id });
    await Badge.deleteMany({ userId: user._id });
    console.log('🧹 Cleared existing portfolio data');

    // Insert Courses (Academic)
    const courses = [
      {
        userId: user._id,
        courseCode: 'CS101',
        courseName: 'Lập trình cơ bản',
        credits: 3,
        grade: 'A',
        gpa: 4.0,
        semester: 'Fall 2023',
        instructor: 'TS. Nguyễn Văn A',
        institution: 'Đại học Công nghệ Thông tin',
        status: 'completed'
      },
      {
        userId: user._id,
        courseCode: 'CS102',
        courseName: 'Cấu trúc dữ liệu và giải thuật',
        credits: 4,
        grade: 'A-',
        gpa: 3.7,
        semester: 'Fall 2023',
        instructor: 'TS. Trần Thị B',
        institution: 'Đại học Công nghệ Thông tin',
        status: 'completed'
      },
      {
        userId: user._id,
        courseCode: 'CS201',
        courseName: 'Cơ sở dữ liệu',
        credits: 3,
        grade: 'A+',
        gpa: 4.0,
        semester: 'Spring 2024',
        instructor: 'TS. Lê Văn C',
        institution: 'Đại học Công nghệ Thông tin',
        status: 'completed'
      },
      {
        userId: user._id,
        courseCode: 'CS202',
        courseName: 'Mạng máy tính',
        credits: 3,
        grade: 'B+',
        gpa: 3.3,
        semester: 'Spring 2024',
        instructor: 'TS. Phạm Thị D',
        institution: 'Đại học Công nghệ Thông tin',
        status: 'completed'
      },
      {
        userId: user._id,
        courseCode: 'CS301',
        courseName: 'Phát triển ứng dụng web',
        credits: 4,
        grade: 'A',
        gpa: 4.0,
        semester: 'Fall 2024',
        instructor: 'TS. Hoàng Văn E',
        institution: 'Đại học Công nghệ Thông tin',
        status: 'completed'
      },
      {
        userId: user._id,
        courseCode: 'CS302',
        courseName: 'Trí tuệ nhân tạo',
        credits: 3,
        grade: 'A-',
        gpa: 3.7,
        semester: 'Fall 2024',
        instructor: 'TS. Vũ Thị F',
        institution: 'Đại học Công nghệ Thông tin',
        status: 'completed'
      }
    ];

    const insertedCourses = await Course.insertMany(courses);
    console.log('✅ Inserted', insertedCourses.length, 'courses');

    // Insert Certificates (Professional)
    const certificates = [
      // Google Certificates
      {
        userId: user._id,
        title: 'Google Cloud Professional Cloud Architect',
        issuer: 'Google Cloud',
        issueDate: new Date('2024-01-15'),
        expiryDate: new Date('2026-01-15'),
        credentialId: 'GCP-PCA-2024-001',
        verificationUrl: 'https://www.credential.net/verify/gcp-pca-2024-001',
        skills: ['Cloud Architecture', 'Google Cloud Platform', 'DevOps', 'Microservices'],
        status: 'verified',
        category: 'Cloud Computing'
      },
      {
        userId: user._id,
        title: 'Google Analytics Individual Qualification',
        issuer: 'Google',
        issueDate: new Date('2023-11-20'),
        expiryDate: new Date('2025-11-20'),
        credentialId: 'GAIQ-2023-002',
        verificationUrl: 'https://skillshop.exceedlms.com/student/award/gaiq-2023-002',
        skills: ['Google Analytics', 'Data Analysis', 'Digital Marketing', 'Web Analytics'],
        status: 'verified',
        category: 'Digital Marketing'
      },
      {
        userId: user._id,
        title: 'Google Ads Search Certification',
        issuer: 'Google',
        issueDate: new Date('2023-09-10'),
        expiryDate: new Date('2025-09-10'),
        credentialId: 'GADS-SEARCH-2023-003',
        verificationUrl: 'https://skillshop.exceedlms.com/student/award/gads-search-2023-003',
        skills: ['Google Ads', 'Search Marketing', 'PPC', 'Campaign Management'],
        status: 'verified',
        category: 'Digital Marketing'
      },

      // IELTS Certificate
      {
        userId: user._id,
        title: 'IELTS Academic',
        issuer: 'British Council',
        issueDate: new Date('2023-08-15'),
        expiryDate: new Date('2025-08-15'),
        credentialId: 'IELTS-AC-2023-004',
        verificationUrl: 'https://ielts.britishcouncil.org/verify/ielts-ac-2023-004',
        skills: ['English Language', 'Academic Writing', 'Speaking', 'Listening', 'Reading'],
        status: 'verified',
        category: 'Language Proficiency',
        score: {
          overall: 7.5,
          listening: 8.0,
          reading: 7.5,
          writing: 7.0,
          speaking: 7.5
        }
      },

      // Udemy Certificates
      {
        userId: user._id,
        title: 'Complete React Developer Course',
        issuer: 'Udemy',
        issueDate: new Date('2024-02-20'),
        expiryDate: null,
        credentialId: 'UDEMY-REACT-2024-005',
        verificationUrl: 'https://www.udemy.com/certificate/UC-udemy-react-2024-005',
        skills: ['React', 'JavaScript', 'Frontend Development', 'Redux', 'Hooks'],
        status: 'verified',
        category: 'Web Development'
      },
      {
        userId: user._id,
        title: 'Node.js Complete Guide',
        issuer: 'Udemy',
        issueDate: new Date('2024-01-10'),
        expiryDate: null,
        credentialId: 'UDEMY-NODE-2024-006',
        verificationUrl: 'https://www.udemy.com/certificate/UC-udemy-node-2024-006',
        skills: ['Node.js', 'Express.js', 'Backend Development', 'MongoDB', 'REST API'],
        status: 'verified',
        category: 'Backend Development'
      },
      {
        userId: user._id,
        title: 'AWS Solutions Architect Associate',
        issuer: 'Udemy',
        issueDate: new Date('2023-12-05'),
        expiryDate: null,
        credentialId: 'UDEMY-AWS-2023-007',
        verificationUrl: 'https://www.udemy.com/certificate/UC-udemy-aws-2023-007',
        skills: ['AWS', 'Cloud Computing', 'Solutions Architecture', 'EC2', 'S3'],
        status: 'verified',
        category: 'Cloud Computing'
      },

      // Coursera Certificates
      {
        userId: user._id,
        title: 'Machine Learning Specialization',
        issuer: 'Stanford University via Coursera',
        issueDate: new Date('2024-03-15'),
        expiryDate: null,
        credentialId: 'COURSERA-ML-2024-008',
        verificationUrl: 'https://www.coursera.org/account/accomplishments/specialization/coursera-ml-2024-008',
        skills: ['Machine Learning', 'Python', 'TensorFlow', 'Neural Networks', 'Data Science'],
        status: 'verified',
        category: 'Data Science'
      },
      {
        userId: user._id,
        title: 'Deep Learning Specialization',
        issuer: 'DeepLearning.AI via Coursera',
        issueDate: new Date('2024-04-20'),
        expiryDate: null,
        credentialId: 'COURSERA-DL-2024-009',
        verificationUrl: 'https://www.coursera.org/account/accomplishments/specialization/coursera-dl-2024-009',
        skills: ['Deep Learning', 'Neural Networks', 'Computer Vision', 'NLP', 'TensorFlow'],
        status: 'verified',
        category: 'Artificial Intelligence'
      },
      {
        userId: user._id,
        title: 'Google Data Analytics Professional Certificate',
        issuer: 'Google via Coursera',
        issueDate: new Date('2023-10-30'),
        expiryDate: null,
        credentialId: 'COURSERA-GDA-2023-010',
        verificationUrl: 'https://www.coursera.org/account/accomplishments/professional-cert/coursera-gda-2023-010',
        skills: ['Data Analytics', 'SQL', 'Tableau', 'R Programming', 'Statistics'],
        status: 'verified',
        category: 'Data Analytics'
      },

      // University Certificates
      {
        userId: user._id,
        title: 'Bachelor of Computer Science',
        issuer: 'Đại học Công nghệ Thông tin',
        issueDate: new Date('2024-06-15'),
        expiryDate: null,
        credentialId: 'UIT-BCS-2024-011',
        verificationUrl: 'https://verify.uit.edu.vn/bcs-2024-011',
        skills: ['Computer Science', 'Software Engineering', 'Algorithms', 'Database Systems'],
        status: 'verified',
        category: 'Academic Degree',
        gpa: 3.8
      },
      {
        userId: user._id,
        title: 'Dean\'s List Recognition',
        issuer: 'Đại học Công nghệ Thông tin',
        issueDate: new Date('2024-01-20'),
        expiryDate: null,
        credentialId: 'UIT-DEANS-2024-012',
        verificationUrl: 'https://verify.uit.edu.vn/deans-2024-012',
        skills: ['Academic Excellence', 'Leadership', 'Scholarship'],
        status: 'verified',
        category: 'Academic Achievement'
      }
    ];

    const insertedCertificates = await Certificate.insertMany(certificates);
    console.log('✅ Inserted', insertedCertificates.length, 'certificates');

    // Insert Badges
    const badges = [
      {
        userId: user._id,
        title: 'Cloud Expert',
        description: 'Mastered multiple cloud platforms including AWS and Google Cloud',
        issuer: 'EduWallet',
        issueDate: new Date('2024-04-01'),
        category: 'Technology',
        criteria: 'Completed 3+ cloud computing certifications',
        skills: ['AWS', 'Google Cloud', 'Cloud Architecture'],
        status: 'earned'
      },
      {
        userId: user._id,
        title: 'Data Science Enthusiast',
        description: 'Demonstrated expertise in data science and machine learning',
        issuer: 'EduWallet',
        issueDate: new Date('2024-03-20'),
        category: 'Data Science',
        criteria: 'Completed ML and Deep Learning specializations',
        skills: ['Machine Learning', 'Deep Learning', 'Data Analysis'],
        status: 'earned'
      },
      {
        userId: user._id,
        title: 'Full Stack Developer',
        description: 'Proficient in both frontend and backend development',
        issuer: 'EduWallet',
        issueDate: new Date('2024-02-15'),
        category: 'Web Development',
        criteria: 'Completed React and Node.js courses',
        skills: ['React', 'Node.js', 'Full Stack Development'],
        status: 'earned'
      },
      {
        userId: user._id,
        title: 'Academic Excellence',
        description: 'Maintained high GPA and earned Dean\'s List recognition',
        issuer: 'EduWallet',
        issueDate: new Date('2024-01-25'),
        category: 'Academic',
        criteria: 'GPA 3.8+ and Dean\'s List recognition',
        skills: ['Academic Excellence', 'Leadership'],
        status: 'earned'
      },
      {
        userId: user._id,
        title: 'Language Proficient',
        description: 'Achieved high IELTS score demonstrating English proficiency',
        issuer: 'EduWallet',
        issueDate: new Date('2023-09-01'),
        category: 'Language',
        criteria: 'IELTS 7.5+ overall score',
        skills: ['English Language', 'Communication'],
        status: 'earned'
      }
    ];

    const insertedBadges = await Badge.insertMany(badges);
    console.log('✅ Inserted', insertedBadges.length, 'badges');

    // Calculate and display statistics
    const totalCourses = insertedCourses.length;
    const totalCertificates = insertedCertificates.length;
    const totalBadges = insertedBadges.length;
    
    const averageGPA = insertedCourses.reduce((sum, course) => sum + course.gpa, 0) / totalCourses;
    const totalCredits = insertedCourses.reduce((sum, course) => sum + course.credits, 0);

    console.log('\n📊 Portfolio Statistics:');
    console.log('========================');
    console.log(`👤 User: ${user.email}`);
    console.log(`📚 Total Courses: ${totalCourses}`);
    console.log(`🏆 Total Certificates: ${totalCertificates}`);
    console.log(`🎖️  Total Badges: ${totalBadges}`);
    console.log(`📈 Average GPA: ${averageGPA.toFixed(2)}`);
    console.log(`🎓 Total Credits: ${totalCredits}`);
    console.log(`📅 Portfolio Created: ${new Date().toLocaleDateString()}`);

    console.log('\n🎯 Certificate Categories:');
    const categories = [...new Set(insertedCertificates.map(cert => cert.category))];
    categories.forEach(category => {
      const count = insertedCertificates.filter(cert => cert.category === category).length;
      console.log(`   • ${category}: ${count} certificates`);
    });

    console.log('\n✅ Portfolio data insertion completed successfully!');

  } catch (error) {
    console.error('❌ Error inserting portfolio data:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
insertPortfolioData();
