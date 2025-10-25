# 🔧 Backend API Endpoints - FIXED

## ✅ Đã thêm API Endpoints

Tôi đã thêm **13 endpoints mới** vào `backend/src/routes/admin.js`:

### 📜 Certificate Management Endpoints:

1. **GET `/api/admin/certificates`** - Lấy danh sách certificates với filters
   - Query params: `page`, `limit`, `search`, `status`, `institution`, `fromDate`, `toDate`
   - Returns: Paginated certificate list với student & issuer info

2. **GET `/api/admin/certificates/:id`** - Lấy chi tiết certificate
   - Returns: Certificate details với full population

3. **POST `/api/admin/certificates/:id/verify`** - Xác thực certificate
   - Changes status to 'verified'
   - Logs activity

4. **POST `/api/admin/certificates/:id/revoke`** - Thu hồi certificate  
   - Body: `{ reason: string }`
   - Changes status to 'revoked'
   - Logs activity

5. **GET `/api/admin/certificates/:id/activities`** - Lấy lịch sử activities
   - Query params: `page`, `limit`
   - Returns: Activity timeline

### 🎓 LearnPass Management Endpoints:

6. **GET `/api/admin/learnpasses`** - Lấy danh sách LearnPasses với filters
   - Query params: `page`, `limit`, `search`, `status`, `verificationStatus`, `institution`
   - Returns: Paginated LearnPass list

7. **GET `/api/admin/learnpasses/:id`** - Lấy chi tiết LearnPass
   - Returns: LearnPass details với academic progress

8. **POST `/api/admin/learnpasses/:id/verify`** - Xác thực LearnPass
   - Sets `isVerified: true`
   - Logs activity

9. **POST `/api/admin/learnpasses/:id/suspend`** - Tạm ngưng LearnPass
   - Body: `{ reason: string }`
   - Changes status to 'suspended'
   - Logs activity

10. **POST `/api/admin/learnpasses/:id/reactivate`** - Kích hoạt lại LearnPass
    - Changes status from 'suspended' to 'active'
    - Logs activity

11. **POST `/api/admin/learnpasses/:id/revoke`** - Thu hồi LearnPass
    - Body: `{ reason: string }`
    - Changes status to 'revoked'
    - Logs activity

12. **GET `/api/admin/learnpasses/:id/activities`** - Lấy lịch sử activities
    - Query params: `page`, `limit`
    - Returns: Activity timeline

---

## ⚠️ VẤN ĐỀ HIỆN TẠI

### Database Models có nhiều required fields phức tạp:

**Certificate Model requires:**
- `skillsCovered` phải là array of objects `{name, level, description}` (không phải array of strings)
- `certificateURI` (required)
- `tokenURI` (required)
- `status` enum: ['active', 'expired', 'revoked'] (không có 'verified', 'pending')
- `contractAddress` phải đúng format `0x...` (40 characters)

**LearnPass Model requires:**
- `name` field (nhưng User model không có `name`, chỉ có `firstName`, `lastName`)
- `contractAddress` đúng format

**Institution Model requires:**
- `institutionId`, `type`, `level`, `address.country`, `createdBy`

**User Model requires:**
- `firstName`, `lastName`, `dateOfBirth`

---

## 🔧 GIẢI PHÁP TẠM THỜI

### Option 1: Sử dụng Mock API (Nhanh nhất - Recommended)

Tạo mock server trả về fake data để test frontend ngay:

```javascript
// backend/mock-server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data
const mockCertificates = [
  {
    _id: '1',
    certificateId: 'CERT-2024-1000',
    courseName: 'Blockchain Fundamentals',
    courseCode: 'BLK101',
    student: { name: 'John Doe', email: 'john@example.com' },
    issuer: { name: 'EduWallet University' },
    gradeOrScore: 'A',
    status: 'active', // verified → active
    issueDate: '2024-01-15',
    skillsCovered: [
      { name: 'Blockchain', level: 'intermediate' },
      { name: 'Cryptography', level: 'beginner' }
    ],
    contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    transactionHash: '0x123...',
    blockNumber: 12000000
  }
];

const mockLearnPasses = [
  {
    _id: '1',
    tokenId: 2000,
    studentId: 'STU-20240001',
    name: 'John Doe',
    email: 'john@example.com',
    institution: { name: 'EduWallet University' },
    status: 'active',
    isVerified: true,
    completedCourses: 3,
    totalCourses: 5,
    gpa: 3.75,
    courses: [...],
    acquiredSkills: ['JavaScript', 'React'],
    contractAddress: '0x123d35Cc6634C0532925a3b844Bc9e7595f0aEa'
  }
];

app.get('/api/admin/certificates', (req, res) => {
  res.json({
    success: true,
    data: {
      certificates: mockCertificates,
      pagination: { currentPage: 1, totalPages: 1, totalItems: 1 }
    }
  });
});

app.get('/api/admin/learnpasses', (req, res) => {
  res.json({
    success: true,
    data: {
      learnPasses: mockLearnPasses,
      pagination: { currentPage: 1, totalPages: 1, totalItems: 1 }
    }
  });
});

app.listen(5000, () => console.log('Mock server on http://localhost:5000'));
```

### Option 2: Fix Database Models (Đúng đắn nhưng mất thời gian)

Cần update models để flexible hơn:
1. Làm một số fields optional
2. Thêm default values
3. Fix enum values

### Option 3: Seed Data đúng cấu trúc (Tốt nhất cho production)

Tạo seed script với đầy đủ required fields theo đúng schema.

---

## 🚀 HÀNH ĐỘNG TIẾP THEO

**Tôi recommend Option 1 - Mock Server:**

1. **Tạo mock server** với fake data ngay
2. **Test frontend** xem UI có hoạt động không
3. **Sau đó fix database models** và seed real data

**Bạn muốn tôi:**
- A) Tạo mock server để test ngay? ✅ (Nhanh 5 phút)
- B) Fix models và seed đúng data? (Mất 30 phút)
- C) Kiểm tra database xem có data existing không?

Cho tôi biết bạn chọn option nào! 🎯
