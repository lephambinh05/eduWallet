const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock Certificate Data
const mockCertificates = [
  {
    _id: '673d1e1f1234567890abcd01',
    tokenId: 1000,
    certificateId: 'CERT-2024-1000',
    student: {
      _id: '673d1e1f1234567890abc001',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
    },
    studentAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    courseName: 'Blockchain Fundamentals',
    courseCode: 'BLK101',
    courseDescription: 'Comprehensive course covering blockchain technology fundamentals',
    issuer: {
      _id: '673d1e1f1234567890abc101',
      name: 'EduWallet University',
      logo: 'https://via.placeholder.com/150'
    },
    issuerName: 'EduWallet University',
    issueDate: '2024-01-15T00:00:00.000Z',
    completionDate: '2024-01-10T00:00:00.000Z',
    gradeOrScore: 'A',
    creditsEarned: 3,
    duration: 40,
    skillsCovered: ['Blockchain', 'Cryptography', 'Bitcoin', 'Ethereum'],
    status: 'verified',
    contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    transactionHash: '0x123abc456def789012345678901234567890123456789012345678901234abcd',
    blockNumber: 12000000,
    metadata: {
      imageUrl: 'https://via.placeholder.com/600x400?text=Certificate',
      pdfUrl: 'https://eduwallet.edu/certificates/1000.pdf'
    },
    verifiedAt: '2024-01-16T00:00:00.000Z',
    createdAt: '2024-01-15T00:00:00.000Z'
  },
  {
    _id: '673d1e1f1234567890abcd02',
    tokenId: 1001,
    certificateId: 'CERT-2024-1001',
    student: {
      _id: '673d1e1f1234567890abc002',
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
      walletAddress: '0x853e46Dd7745D0643D0724Cc0e8654Ba0eF1cCd'
    },
    studentAddress: '0x853e46Dd7745D0643D0724Cc0e8654Ba0eF1cCd',
    courseName: 'Smart Contract Development',
    courseCode: 'BLK201',
    courseDescription: 'Advanced course on developing smart contracts with Solidity',
    issuer: {
      _id: '673d1e1f1234567890abc101',
      name: 'EduWallet University',
      logo: 'https://via.placeholder.com/150'
    },
    issuerName: 'EduWallet University',
    issueDate: '2024-01-22T00:00:00.000Z',
    completionDate: '2024-01-17T00:00:00.000Z',
    gradeOrScore: 'A+',
    creditsEarned: 4,
    duration: 60,
    skillsCovered: ['Solidity', 'Smart Contracts', 'Ethereum', 'Testing'],
    status: 'pending',
    contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    transactionHash: '0x456def789012345678901234567890123456789012345678901234567890efgh',
    blockNumber: 12000100,
    metadata: {
      imageUrl: 'https://via.placeholder.com/600x400?text=Certificate',
      pdfUrl: 'https://eduwallet.edu/certificates/1001.pdf'
    },
    createdAt: '2024-01-22T00:00:00.000Z'
  },
  {
    _id: '673d1e1f1234567890abcd03',
    tokenId: 1002,
    certificateId: 'CERT-2024-1002',
    student: {
      _id: '673d1e1f1234567890abc003',
      name: 'Lê Văn C',
      email: 'levanc@example.com',
      walletAddress: '0x964f57Fe8456D1534D0825Dd0f9765Ca1fF2dDe'
    },
    studentAddress: '0x964f57Fe8456D1534D0825Dd0f9765Ca1fF2dDe',
    courseName: 'DApp Development',
    courseCode: 'BLK301',
    courseDescription: 'Build decentralized applications with React and Web3',
    issuer: {
      _id: '673d1e1f1234567890abc101',
      name: 'EduWallet University',
      logo: 'https://via.placeholder.com/150'
    },
    issuerName: 'EduWallet University',
    issueDate: '2024-01-29T00:00:00.000Z',
    completionDate: '2024-01-24T00:00:00.000Z',
    gradeOrScore: 'B+',
    creditsEarned: 4,
    duration: 50,
    skillsCovered: ['React', 'Web3.js', 'Ethers.js', 'Frontend'],
    status: 'verified',
    contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    transactionHash: '0x789012345678901234567890123456789012345678901234567890123456ijkl',
    blockNumber: 12000200,
    metadata: {
      imageUrl: 'https://via.placeholder.com/600x400?text=Certificate',
      pdfUrl: 'https://eduwallet.edu/certificates/1002.pdf'
    },
    verifiedAt: '2024-01-30T00:00:00.000Z',
    createdAt: '2024-01-29T00:00:00.000Z'
  },
  {
    _id: '673d1e1f1234567890abcd04',
    tokenId: 1003,
    certificateId: 'CERT-2024-1003',
    student: {
      _id: '673d1e1f1234567890abc004',
      name: 'Phạm Thị D',
      email: 'phamthid@example.com',
      walletAddress: '0xa75g68Gf9567E2645E1936Ee1g0876Db2gG3eEf'
    },
    studentAddress: '0xa75g68Gf9567E2645E1936Ee1g0876Db2gG3eEf',
    courseName: 'Web3 Security',
    courseCode: 'BLK401',
    courseDescription: 'Learn security best practices for Web3 applications',
    issuer: {
      _id: '673d1e1f1234567890abc101',
      name: 'EduWallet University',
      logo: 'https://via.placeholder.com/150'
    },
    issuerName: 'EduWallet University',
    issueDate: '2024-02-05T00:00:00.000Z',
    completionDate: '2024-01-31T00:00:00.000Z',
    gradeOrScore: 'A',
    creditsEarned: 3,
    duration: 45,
    skillsCovered: ['Security', 'Auditing', 'Best Practices', 'Penetration Testing'],
    status: 'verified',
    contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    transactionHash: '0x901234567890123456789012345678901234567890123456789012345678mnop',
    blockNumber: 12000300,
    metadata: {
      imageUrl: 'https://via.placeholder.com/600x400?text=Certificate',
      pdfUrl: 'https://eduwallet.edu/certificates/1003.pdf'
    },
    verifiedAt: '2024-02-06T00:00:00.000Z',
    createdAt: '2024-02-05T00:00:00.000Z'
  },
  {
    _id: '673d1e1f1234567890abcd05',
    tokenId: 1004,
    certificateId: 'CERT-2024-1004',
    student: {
      _id: '673d1e1f1234567890abc005',
      name: 'Hoàng Văn E',
      email: 'hoangvane@example.com',
      walletAddress: '0xb86h79Hg0678F3756F2047Ff2h1987Ec3hH4fFg'
    },
    studentAddress: '0xb86h79Hg0678F3756F2047Ff2h1987Ec3hH4fFg',
    courseName: 'NFT & Digital Assets',
    courseCode: 'BLK202',
    courseDescription: 'Create and manage NFTs and digital assets on blockchain',
    issuer: {
      _id: '673d1e1f1234567890abc101',
      name: 'EduWallet University',
      logo: 'https://via.placeholder.com/150'
    },
    issuerName: 'EduWallet University',
    issueDate: '2024-02-12T00:00:00.000Z',
    completionDate: '2024-02-07T00:00:00.000Z',
    gradeOrScore: 'B',
    creditsEarned: 3,
    duration: 35,
    skillsCovered: ['NFTs', 'ERC-721', 'ERC-1155', 'Digital Art'],
    status: 'pending',
    contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    transactionHash: '0x012345678901234567890123456789012345678901234567890123456789qrst',
    blockNumber: 12000400,
    metadata: {
      imageUrl: 'https://via.placeholder.com/600x400?text=Certificate',
      pdfUrl: 'https://eduwallet.edu/certificates/1004.pdf'
    },
    createdAt: '2024-02-12T00:00:00.000Z'
  }
];

// Mock LearnPass Data
const mockLearnPasses = [
  {
    _id: '673d1e1f1234567890abce01',
    tokenId: 2000,
    owner: {
      _id: '673d1e1f1234567890abc001',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
    },
    studentId: 'STU-20240001',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    institutionId: {
      _id: '673d1e1f1234567890abc101',
      name: 'EduWallet University',
      logo: 'https://via.placeholder.com/150'
    },
    profilePictureURI: 'https://via.placeholder.com/150',
    tokenURI: 'https://eduwallet.edu/learnpass/2000',
    contractAddress: '0x123d35Cc6634C0532925a3b844Bc9e7595f0aEa',
    transactionHash: '0xabc123def456789012345678901234567890123456789012345678901234uvwx',
    blockNumber: 12000500,
    status: 'active',
    isVerified: true,
    verifiedAt: '2024-01-20T00:00:00.000Z',
    courses: [
      { courseId: 'C1', courseName: 'Blockchain Fundamentals', courseCode: 'BLK101', credits: 3, status: 'completed', grade: 'A', completedAt: '2024-01-15T00:00:00.000Z' },
      { courseId: 'C2', courseName: 'Smart Contracts', courseCode: 'BLK201', credits: 4, status: 'completed', grade: 'A+', completedAt: '2024-02-15T00:00:00.000Z' },
      { courseId: 'C3', courseName: 'DApp Development', courseCode: 'BLK301', credits: 4, status: 'completed', grade: 'B+', completedAt: '2024-03-15T00:00:00.000Z' },
      { courseId: 'C4', courseName: 'Web3 Security', courseCode: 'BLK401', credits: 3, status: 'in-progress', grade: null, completedAt: null },
      { courseId: 'C5', courseName: 'Advanced Blockchain', courseCode: 'BLK501', credits: 4, status: 'in-progress', grade: null, completedAt: null }
    ],
    completedCourses: 3,
    totalCourses: 5,
    acquiredSkills: ['Blockchain', 'Solidity', 'React', 'Web3.js', 'Smart Contracts', 'DApp', 'Security', 'Testing'],
    totalSkills: 12,
    gpa: 3.75,
    totalCredits: 11,
    metadata: {
      imageUrl: 'https://via.placeholder.com/400x400?text=LearnPass',
      description: 'Academic LearnPass for Nguyễn Văn A'
    },
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '673d1e1f1234567890abce02',
    tokenId: 2001,
    owner: {
      _id: '673d1e1f1234567890abc002',
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
      walletAddress: '0x853e46Dd7745D0643D0724Cc0e8654Ba0eF1cCd'
    },
    studentId: 'STU-20240002',
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    institutionId: {
      _id: '673d1e1f1234567890abc101',
      name: 'EduWallet University',
      logo: 'https://via.placeholder.com/150'
    },
    profilePictureURI: 'https://via.placeholder.com/150',
    tokenURI: 'https://eduwallet.edu/learnpass/2001',
    contractAddress: '0x123d35Cc6634C0532925a3b844Bc9e7595f0aEa',
    transactionHash: '0xdef456789012345678901234567890123456789012345678901234567890yzab',
    blockNumber: 12000600,
    status: 'active',
    isVerified: true,
    verifiedAt: '2024-01-25T00:00:00.000Z',
    courses: [
      { courseId: 'C1', courseName: 'Blockchain Fundamentals', courseCode: 'BLK101', credits: 3, status: 'completed', grade: 'A+', completedAt: '2024-01-20T00:00:00.000Z' },
      { courseId: 'C2', courseName: 'Smart Contracts', courseCode: 'BLK201', credits: 4, status: 'completed', grade: 'A+', completedAt: '2024-02-20T00:00:00.000Z' },
      { courseId: 'C3', courseName: 'DApp Development', courseCode: 'BLK301', credits: 4, status: 'completed', grade: 'A', completedAt: '2024-03-20T00:00:00.000Z' },
      { courseId: 'C4', courseName: 'Web3 Security', courseCode: 'BLK401', credits: 3, status: 'completed', grade: 'A', completedAt: '2024-04-20T00:00:00.000Z' },
      { courseId: 'C5', courseName: 'Advanced Blockchain', courseCode: 'BLK501', credits: 4, status: 'completed', grade: 'A+', completedAt: '2024-05-20T00:00:00.000Z' },
      { courseId: 'C6', courseName: 'Blockchain Research', courseCode: 'BLK601', credits: 5, status: 'in-progress', grade: null, completedAt: null }
    ],
    completedCourses: 5,
    totalCourses: 6,
    acquiredSkills: ['Blockchain', 'Solidity', 'React', 'Web3.js', 'Smart Contracts', 'DApp', 'Security', 'Testing', 'Auditing', 'NFTs', 'Ethers.js', 'Node.js'],
    totalSkills: 15,
    gpa: 3.90,
    totalCredits: 18,
    metadata: {
      imageUrl: 'https://via.placeholder.com/400x400?text=LearnPass',
      description: 'Academic LearnPass for Trần Thị B'
    },
    createdAt: '2024-01-05T00:00:00.000Z'
  },
  {
    _id: '673d1e1f1234567890abce03',
    tokenId: 2002,
    owner: {
      _id: '673d1e1f1234567890abc003',
      name: 'Lê Văn C',
      email: 'levanc@example.com',
      walletAddress: '0x964f57Fe8456D1534D0825Dd0f9765Ca1fF2dDe'
    },
    studentId: 'STU-20240003',
    name: 'Lê Văn C',
    email: 'levanc@example.com',
    institutionId: {
      _id: '673d1e1f1234567890abc101',
      name: 'EduWallet University',
      logo: 'https://via.placeholder.com/150'
    },
    profilePictureURI: 'https://via.placeholder.com/150',
    tokenURI: 'https://eduwallet.edu/learnpass/2002',
    contractAddress: '0x123d35Cc6634C0532925a3b844Bc9e7595f0aEa',
    transactionHash: '0x789012345678901234567890123456789012345678901234567890123456cdef',
    blockNumber: 12000700,
    status: 'suspended',
    isVerified: false,
    suspendedAt: '2024-03-01T00:00:00.000Z',
    suspensionReason: 'Academic integrity violation under investigation',
    courses: [
      { courseId: 'C1', courseName: 'Blockchain Fundamentals', courseCode: 'BLK101', credits: 3, status: 'completed', grade: 'B+', completedAt: '2024-01-25T00:00:00.000Z' },
      { courseId: 'C2', courseName: 'Smart Contracts', courseCode: 'BLK201', credits: 4, status: 'completed', grade: 'B', completedAt: '2024-02-25T00:00:00.000Z' },
      { courseId: 'C3', courseName: 'DApp Development', courseCode: 'BLK301', credits: 4, status: 'in-progress', grade: null, completedAt: null },
      { courseId: 'C4', courseName: 'Web3 Security', courseCode: 'BLK401', credits: 3, status: 'in-progress', grade: null, completedAt: null }
    ],
    completedCourses: 2,
    totalCourses: 4,
    acquiredSkills: ['Blockchain', 'Solidity', 'React', 'Web3.js', 'Smart Contracts'],
    totalSkills: 10,
    gpa: 3.50,
    totalCredits: 7,
    metadata: {
      imageUrl: 'https://via.placeholder.com/400x400?text=LearnPass',
      description: 'Academic LearnPass for Lê Văn C'
    },
    createdAt: '2024-01-10T00:00:00.000Z'
  },
  {
    _id: '673d1e1f1234567890abce04',
    tokenId: 2003,
    owner: {
      _id: '673d1e1f1234567890abc004',
      name: 'Phạm Thị D',
      email: 'phamthid@example.com',
      walletAddress: '0xa75g68Gf9567E2645E1936Ee1g0876Db2gG3eEf'
    },
    studentId: 'STU-20240004',
    name: 'Phạm Thị D',
    email: 'phamthid@example.com',
    institutionId: {
      _id: '673d1e1f1234567890abc101',
      name: 'EduWallet University',
      logo: 'https://via.placeholder.com/150'
    },
    profilePictureURI: 'https://via.placeholder.com/150',
    tokenURI: 'https://eduwallet.edu/learnpass/2003',
    contractAddress: '0x123d35Cc6634C0532925a3b844Bc9e7595f0aEa',
    transactionHash: '0x901234567890123456789012345678901234567890123456789012345678ghij',
    blockNumber: 12000800,
    status: 'active',
    isVerified: true,
    verifiedAt: '2024-02-10T00:00:00.000Z',
    courses: [
      { courseId: 'C1', courseName: 'Blockchain Fundamentals', courseCode: 'BLK101', credits: 3, status: 'completed', grade: 'A', completedAt: '2024-02-05T00:00:00.000Z' },
      { courseId: 'C2', courseName: 'Smart Contracts', courseCode: 'BLK201', credits: 4, status: 'completed', grade: 'A', completedAt: '2024-03-05T00:00:00.000Z' },
      { courseId: 'C3', courseName: 'DApp Development', courseCode: 'BLK301', credits: 4, status: 'completed', grade: 'A+', completedAt: '2024-04-05T00:00:00.000Z' },
      { courseId: 'C4', courseName: 'Web3 Security', courseCode: 'BLK401', credits: 3, status: 'completed', grade: 'A', completedAt: '2024-05-05T00:00:00.000Z' },
      { courseId: 'C5', courseName: 'Advanced Blockchain', courseCode: 'BLK501', credits: 4, status: 'in-progress', grade: null, completedAt: null }
    ],
    completedCourses: 4,
    totalCourses: 5,
    acquiredSkills: ['Blockchain', 'Solidity', 'React', 'Web3.js', 'Smart Contracts', 'DApp', 'Security', 'Testing', 'Auditing', 'NFTs'],
    totalSkills: 12,
    gpa: 3.85,
    totalCredits: 14,
    metadata: {
      imageUrl: 'https://via.placeholder.com/400x400?text=LearnPass',
      description: 'Academic LearnPass for Phạm Thị D'
    },
    createdAt: '2024-01-15T00:00:00.000Z'
  },
  {
    _id: '673d1e1f1234567890abce05',
    tokenId: 2004,
    owner: {
      _id: '673d1e1f1234567890abc005',
      name: 'Hoàng Văn E',
      email: 'hoangvane@example.com',
      walletAddress: '0xb86h79Hg0678F3756F2047Ff2h1987Ec3hH4fFg'
    },
    studentId: 'STU-20240005',
    name: 'Hoàng Văn E',
    email: 'hoangvane@example.com',
    institutionId: {
      _id: '673d1e1f1234567890abc101',
      name: 'EduWallet University',
      logo: 'https://via.placeholder.com/150'
    },
    profilePictureURI: 'https://via.placeholder.com/150',
    tokenURI: 'https://eduwallet.edu/learnpass/2004',
    contractAddress: '0x123d35Cc6634C0532925a3b844Bc9e7595f0aEa',
    transactionHash: '0x012345678901234567890123456789012345678901234567890123456789klmn',
    blockNumber: 12000900,
    status: 'active',
    isVerified: false,
    courses: [
      { courseId: 'C1', courseName: 'Blockchain Fundamentals', courseCode: 'BLK101', credits: 3, status: 'completed', grade: 'B+', completedAt: '2024-02-15T00:00:00.000Z' },
      { courseId: 'C2', courseName: 'Smart Contracts', courseCode: 'BLK201', credits: 4, status: 'in-progress', grade: null, completedAt: null },
      { courseId: 'C3', courseName: 'DApp Development', courseCode: 'BLK301', credits: 4, status: 'in-progress', grade: null, completedAt: null }
    ],
    completedCourses: 1,
    totalCourses: 3,
    acquiredSkills: ['Blockchain', 'Cryptography', 'Bitcoin'],
    totalSkills: 8,
    gpa: 3.60,
    totalCredits: 3,
    metadata: {
      imageUrl: 'https://via.placeholder.com/400x400?text=LearnPass',
      description: 'Academic LearnPass for Hoàng Văn E'
    },
    createdAt: '2024-02-01T00:00:00.000Z'
  }
];

// Mock Activities
const mockActivities = [
  {
    _id: 'act001',
    user: { _id: 'admin001', name: 'Admin User', email: 'admin@eduwallet.com' },
    action: 'certificate_verified',
    createdAt: '2024-01-16T00:00:00.000Z',
    details: { reason: 'Approved after verification' }
  },
  {
    _id: 'act002',
    user: { _id: 'admin001', name: 'Admin User', email: 'admin@eduwallet.com' },
    action: 'certificate_created',
    createdAt: '2024-01-15T00:00:00.000Z',
    details: { reason: 'Initial creation' }
  }
];

// ==================== CERTIFICATES ENDPOINTS ====================

// Get all certificates
app.get('/api/admin/certificates', (req, res) => {
  const { page = 1, limit = 12, search, status } = req.query;
  
  let filtered = [...mockCertificates];
  
  // Search filter
  if (search) {
    filtered = filtered.filter(cert => 
      cert.courseName.toLowerCase().includes(search.toLowerCase()) ||
      cert.certificateId.toLowerCase().includes(search.toLowerCase()) ||
      cert.student.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Status filter
  if (status) {
    filtered = filtered.filter(cert => cert.status === status);
  }
  
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedCerts = filtered.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      certificates: paginatedCerts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filtered.length / parseInt(limit)),
        totalItems: filtered.length,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

// Get certificate by ID
app.get('/api/admin/certificates/:id', (req, res) => {
  const cert = mockCertificates.find(c => c._id === req.params.id);
  
  if (!cert) {
    return res.status(404).json({
      success: false,
      message: 'Certificate not found'
    });
  }
  
  res.json({
    success: true,
    data: { certificate: cert }
  });
});

// Verify certificate
app.post('/api/admin/certificates/:id/verify', (req, res) => {
  const cert = mockCertificates.find(c => c._id === req.params.id);
  
  if (!cert) {
    return res.status(404).json({
      success: false,
      message: 'Certificate not found'
    });
  }
  
  cert.status = 'verified';
  cert.verifiedAt = new Date().toISOString();
  
  res.json({
    success: true,
    message: 'Certificate verified successfully',
    data: { certificate: cert }
  });
});

// Revoke certificate
app.post('/api/admin/certificates/:id/revoke', (req, res) => {
  const cert = mockCertificates.find(c => c._id === req.params.id);
  
  if (!cert) {
    return res.status(404).json({
      success: false,
      message: 'Certificate not found'
    });
  }
  
  cert.status = 'revoked';
  cert.revokedAt = new Date().toISOString();
  cert.revocationReason = req.body.reason;
  
  res.json({
    success: true,
    message: 'Certificate revoked successfully',
    data: { certificate: cert }
  });
});

// Get certificate activities
app.get('/api/admin/certificates/:id/activities', (req, res) => {
  res.json({
    success: true,
    data: {
      activities: mockActivities,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: mockActivities.length
      }
    }
  });
});

// ==================== LEARNPASSES ENDPOINTS ====================

// Get all LearnPasses
app.get('/api/admin/learnpasses', (req, res) => {
  const { page = 1, limit = 12, search, status, verificationStatus } = req.query;
  
  let filtered = [...mockLearnPasses];
  
  // Search filter
  if (search) {
    filtered = filtered.filter(lp => 
      lp.name.toLowerCase().includes(search.toLowerCase()) ||
      lp.studentId.toLowerCase().includes(search.toLowerCase()) ||
      lp.email.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Status filter
  if (status) {
    filtered = filtered.filter(lp => lp.status === status);
  }
  
  // Verification filter
  if (verificationStatus === 'verified') {
    filtered = filtered.filter(lp => lp.isVerified === true);
  } else if (verificationStatus === 'unverified') {
    filtered = filtered.filter(lp => lp.isVerified === false);
  }
  
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedLPs = filtered.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      learnPasses: paginatedLPs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filtered.length / parseInt(limit)),
        totalItems: filtered.length,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

// Get LearnPass by ID
app.get('/api/admin/learnpasses/:id', (req, res) => {
  const lp = mockLearnPasses.find(l => l._id === req.params.id);
  
  if (!lp) {
    return res.status(404).json({
      success: false,
      message: 'LearnPass not found'
    });
  }
  
  res.json({
    success: true,
    data: { learnPass: lp }
  });
});

// Verify LearnPass
app.post('/api/admin/learnpasses/:id/verify', (req, res) => {
  const lp = mockLearnPasses.find(l => l._id === req.params.id);
  
  if (!lp) {
    return res.status(404).json({
      success: false,
      message: 'LearnPass not found'
    });
  }
  
  lp.isVerified = true;
  lp.verifiedAt = new Date().toISOString();
  
  res.json({
    success: true,
    message: 'LearnPass verified successfully',
    data: { learnPass: lp }
  });
});

// Suspend LearnPass
app.post('/api/admin/learnpasses/:id/suspend', (req, res) => {
  const lp = mockLearnPasses.find(l => l._id === req.params.id);
  
  if (!lp) {
    return res.status(404).json({
      success: false,
      message: 'LearnPass not found'
    });
  }
  
  lp.status = 'suspended';
  lp.suspendedAt = new Date().toISOString();
  lp.suspensionReason = req.body.reason;
  
  res.json({
    success: true,
    message: 'LearnPass suspended successfully',
    data: { learnPass: lp }
  });
});

// Reactivate LearnPass
app.post('/api/admin/learnpasses/:id/reactivate', (req, res) => {
  const lp = mockLearnPasses.find(l => l._id === req.params.id);
  
  if (!lp) {
    return res.status(404).json({
      success: false,
      message: 'LearnPass not found'
    });
  }
  
  lp.status = 'active';
  lp.reactivatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    message: 'LearnPass reactivated successfully',
    data: { learnPass: lp }
  });
});

// Revoke LearnPass
app.post('/api/admin/learnpasses/:id/revoke', (req, res) => {
  const lp = mockLearnPasses.find(l => l._id === req.params.id);
  
  if (!lp) {
    return res.status(404).json({
      success: false,
      message: 'LearnPass not found'
    });
  }
  
  lp.status = 'revoked';
  lp.revokedAt = new Date().toISOString();
  lp.revocationReason = req.body.reason;
  
  res.json({
    success: true,
    message: 'LearnPass revoked successfully',
    data: { learnPass: lp }
  });
});

// Get LearnPass activities
app.get('/api/admin/learnpasses/:id/activities', (req, res) => {
  res.json({
    success: true,
    data: {
      activities: mockActivities,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: mockActivities.length
      }
    }
  });
});

// ==================== START SERVER ====================

const PORT = 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('🎓 Mock Admin API Server Started!');
  console.log('🚀 ========================================');
  console.log('');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log('');
  console.log('📜 Certificate Endpoints:');
  console.log(`   GET    http://localhost:${PORT}/api/admin/certificates`);
  console.log(`   GET    http://localhost:${PORT}/api/admin/certificates/:id`);
  console.log(`   POST   http://localhost:${PORT}/api/admin/certificates/:id/verify`);
  console.log(`   POST   http://localhost:${PORT}/api/admin/certificates/:id/revoke`);
  console.log(`   GET    http://localhost:${PORT}/api/admin/certificates/:id/activities`);
  console.log('');
  console.log('🎓 LearnPass Endpoints:');
  console.log(`   GET    http://localhost:${PORT}/api/admin/learnpasses`);
  console.log(`   GET    http://localhost:${PORT}/api/admin/learnpasses/:id`);
  console.log(`   POST   http://localhost:${PORT}/api/admin/learnpasses/:id/verify`);
  console.log(`   POST   http://localhost:${PORT}/api/admin/learnpasses/:id/suspend`);
  console.log(`   POST   http://localhost:${PORT}/api/admin/learnpasses/:id/reactivate`);
  console.log(`   POST   http://localhost:${PORT}/api/admin/learnpasses/:id/revoke`);
  console.log(`   GET    http://localhost:${PORT}/api/admin/learnpasses/:id/activities`);
  console.log('');
  console.log('📊 Mock Data:');
  console.log(`   - ${mockCertificates.length} Certificates`);
  console.log(`   - ${mockLearnPasses.length} LearnPasses`);
  console.log('');
  console.log('🔗 Frontend URL: http://localhost:3000/admin/certificates');
  console.log('🔗 Frontend URL: http://localhost:3000/admin/learnpasses');
  console.log('');
  console.log('✅ Ready to test! Press Ctrl+C to stop');
  console.log('========================================');
  console.log('');
});
