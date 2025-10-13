// Simple import script
const mongoose = require('mongoose');

console.log('🚀 Starting simple import...');

mongoose.connect('mongodb://localhost:27017/eduwallet')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const User = require('./src/models/User');
    const SimpleCertificate = require('./src/models/SimpleCertificate');
    const SimpleBadge = require('./src/models/SimpleBadge');
    
    try {
      // Find user
      const user = await User.findOne({ email: 'lephambinh05@gmail.com' });
      if (!user) {
        console.log('❌ User not found');
        return;
      }
      
      console.log('✅ User found:', user.email);
      
      // Clear existing data
      await SimpleCertificate.deleteMany({ userId: user._id });
      await SimpleBadge.deleteMany({ userId: user._id });
      console.log('🧹 Cleared existing data');
      
      // Create certificates data
      const certificates = [
        {
          userId: user._id,
          title: 'Google Cloud Professional Cloud Architect',
          description: 'Chứng chỉ chuyên nghiệp về kiến trúc cloud trên Google Cloud Platform',
          issuer: 'Google Cloud',
          issueDate: '2024-01-15',
          category: 'Cloud Computing',
          level: 'Professional',
          score: 95,
          verificationUrl: 'https://www.credential.net/verify/gcp-pca-2024-001',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Google_Cloud_logo.svg/1200px-Google_Cloud_logo.svg.png'
        },
        {
          userId: user._id,
          title: 'Google Analytics Individual Qualification',
          description: 'Chứng chỉ phân tích dữ liệu web với Google Analytics',
          issuer: 'Google',
          issueDate: '2023-11-20',
          category: 'Business',
          level: 'Intermediate',
          score: 92,
          verificationUrl: 'https://skillshop.exceedlms.com/student/award/gaiq-2023-002',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Google_Cloud_logo.svg/1200px-Google_Cloud_logo.svg.png'
        },
        {
          userId: user._id,
          title: 'IELTS Academic',
          description: 'Chứng chỉ IELTS Academic với điểm số 7.5',
          issuer: 'British Council',
          issueDate: '2023-08-15',
          category: 'Language',
          level: 'Advanced',
          score: 7.5,
          verificationUrl: 'https://ielts.britishcouncil.org/verify/ielts-ac-2023-004',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/IELTS_logo.svg/1200px-IELTS_logo.svg.png'
        },
        {
          userId: user._id,
          title: 'Complete React Developer Course',
          description: 'Khóa học phát triển ứng dụng web với React',
          issuer: 'Udemy',
          issueDate: '2024-02-20',
          category: 'Web Development',
          level: 'Intermediate',
          score: 98,
          verificationUrl: 'https://www.udemy.com/certificate/UC-udemy-react-2024-005',
          imageUrl: 'https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg'
        },
        {
          userId: user._id,
          title: 'Node.js Complete Guide',
          description: 'Khóa học phát triển backend với Node.js',
          issuer: 'Udemy',
          issueDate: '2024-01-10',
          category: 'Web Development',
          level: 'Intermediate',
          score: 89,
          verificationUrl: 'https://www.udemy.com/certificate/UC-udemy-node-2024-006',
          imageUrl: 'https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg'
        },
        {
          userId: user._id,
          title: 'Machine Learning Specialization',
          description: 'Chuyên ngành Machine Learning từ Stanford University',
          issuer: 'Stanford University via Coursera',
          issueDate: '2024-03-15',
          category: 'Machine Learning',
          level: 'Advanced',
          score: 92,
          verificationUrl: 'https://www.coursera.org/account/accomplishments/specialization/coursera-ml-2024-008',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Coursera-Logo_600x600.svg/1200px-Coursera-Logo_600x600.svg.png'
        },
        {
          userId: user._id,
          title: 'Deep Learning Specialization',
          description: 'Chuyên ngành Deep Learning từ DeepLearning.AI',
          issuer: 'DeepLearning.AI via Coursera',
          issueDate: '2024-04-20',
          category: 'Machine Learning',
          level: 'Advanced',
          score: 88,
          verificationUrl: 'https://www.coursera.org/account/accomplishments/specialization/coursera-dl-2024-009',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Coursera-Logo_600x600.svg/1200px-Coursera-Logo_600x600.svg.png'
        },
        {
          userId: user._id,
          title: 'Bachelor of Computer Science',
          description: 'Bằng cử nhân Khoa học Máy tính',
          issuer: 'Đại học Công nghệ Thông tin',
          issueDate: '2024-06-15',
          category: 'Academic',
          level: 'Professional',
          score: 3.8,
          verificationUrl: 'https://verify.uit.edu.vn/bcs-2024-011',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Google_Cloud_logo.svg/1200px-Google_Cloud_logo.svg.png'
        }
      ];
      
      const badges = [
        {
          userId: user._id,
          title: 'Cloud Expert',
          description: 'Thành thạo nhiều nền tảng cloud',
          issuer: 'EduWallet',
          earnedDate: '2024-04-01',
          category: 'Professional',
          level: 'Advanced',
          points: 100,
          rarity: 'Rare',
          iconUrl: 'https://via.placeholder.com/50x50/4CAF50/ffffff?text=CE'
        },
        {
          userId: user._id,
          title: 'Data Science Enthusiast',
          description: 'Chuyên gia về khoa học dữ liệu và machine learning',
          issuer: 'EduWallet',
          earnedDate: '2024-03-20',
          category: 'Skill',
          level: 'Advanced',
          points: 150,
          rarity: 'Epic',
          iconUrl: 'https://via.placeholder.com/50x50/2196F3/ffffff?text=DSE'
        },
        {
          userId: user._id,
          title: 'Full Stack Developer',
          description: 'Thành thạo cả frontend và backend development',
          issuer: 'EduWallet',
          earnedDate: '2024-02-15',
          category: 'Skill',
          level: 'Intermediate',
          points: 120,
          rarity: 'Uncommon',
          iconUrl: 'https://via.placeholder.com/50x50/C0C0C0/ffffff?text=FSD'
        },
        {
          userId: user._id,
          title: 'Academic Excellence',
          description: 'Duy trì GPA cao và được ghi nhận Dean\'s List',
          issuer: 'EduWallet',
          earnedDate: '2024-01-25',
          category: 'Academic',
          level: 'Advanced',
          points: 200,
          rarity: 'Legendary',
          iconUrl: 'https://via.placeholder.com/50x50/FF5722/ffffff?text=AE'
        },
        {
          userId: user._id,
          title: 'Language Proficient',
          description: 'Đạt điểm IELTS cao chứng minh trình độ tiếng Anh',
          issuer: 'EduWallet',
          earnedDate: '2023-09-01',
          category: 'Language',
          level: 'Advanced',
          points: 80,
          rarity: 'Uncommon',
          iconUrl: 'https://via.placeholder.com/50x50/9C27B0/ffffff?text=LP'
        }
      ];
      
      // Insert data
      await SimpleCertificate.insertMany(certificates);
      console.log('✅ Inserted', certificates.length, 'certificates');
      
      await SimpleBadge.insertMany(badges);
      console.log('✅ Inserted', badges.length, 'badges');
      
      console.log('🎉 Import completed successfully!');
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      mongoose.connection.close();
      console.log('🔌 Database connection closed');
    }
  })
  .catch(err => {
    console.error('❌ Connection error:', err.message);
  });
