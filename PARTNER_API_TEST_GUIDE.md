# 🧪 Partner API Testing Guide

## 📋 Tổng Quan

Script test này kiểm tra **tất cả 21 endpoints** của Partner API, bao gồm:
- ✅ API Key Management (4 endpoints)
- ✅ Course Management (6 endpoints)
- ✅ Enrollment & Purchase (6 endpoints)
- ✅ Sales & Analytics (2 endpoints)
- ✅ Completed Courses (4 endpoints)

---

## 🚀 Chuẩn Bị

### 1. Cài Đặt Dependencies

```bash
cd backend
npm install axios colors
```

### 2. Tạo Test Accounts

Bạn cần 2 tài khoản:
1. **Partner Account** - Để tạo và quản lý courses
2. **Student Account** - Để mua và học courses

#### Tạo Partner Account:
```bash
# Sử dụng Postman hoặc curl
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testpartner",
  "email": "partner@test.com",
  "password": "password123",
  "role": "partner",
  "firstName": "Test",
  "lastName": "Partner"
}
```

#### Tạo Student Account:
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "teststudent",
  "email": "student@test.com",
  "password": "password123",
  "role": "student",
  "firstName": "Test",
  "lastName": "Student"
}
```

### 3. Cấu Hình Environment Variables

Tạo file `.env.test` trong thư mục `backend/`:

```env
# Backend URL
BACKEND_URL=http://localhost:5000

# Partner Account
PARTNER_EMAIL=partner@test.com
PARTNER_PASSWORD=password123

# Student Account
STUDENT_EMAIL=student@test.com
STUDENT_PASSWORD=password123
```

---

## 🏃 Chạy Tests

### Cách 1: Sử dụng Environment Variables từ file

```bash
cd backend
node -r dotenv/config scripts/test-partner-api.js dotenv_config_path=.env.test
```

### Cách 2: Sử dụng Environment Variables inline

```bash
cd backend
PARTNER_EMAIL=partner@test.com PARTNER_PASSWORD=password123 STUDENT_EMAIL=student@test.com STUDENT_PASSWORD=password123 node scripts/test-partner-api.js
```

### Cách 3: Sử dụng Default Values (nhanh nhất)

```bash
cd backend
node scripts/test-partner-api.js
```

> **Lưu ý:** Đảm bảo backend đang chạy trên `http://localhost:5000`

---

## 📊 Kết Quả Test

Script sẽ in ra:

### 1. Test Progress
```
🧪 Testing: POST /api/partner/apikey/generate
✅ PASSED: POST /api/partner/apikey/generate

🧪 Testing: GET /api/partner/apikey
✅ PASSED: GET /api/partner/apikey
```

### 2. Test Summary
```
═══════════════════════════════════════════════════════════
📊 TEST SUMMARY
═══════════════════════════════════════════════════════════

✅ Passed: 21/21
❌ Failed: 0/21
📈 Success Rate: 100.0%

🎉 ALL TESTS PASSED! 🎉
```

---

## 🔍 Test Coverage

### API Key Management (4 tests)
- ✅ `POST /api/partner/apikey/generate` - Generate API key
- ✅ `GET /api/partner/apikey` - Get API key metadata
- ✅ `POST /api/partner/apikey/reveal` - Reveal API key
- ✅ `GET /api/partner/apikey/validate` - Validate API key

### Course Management (6 tests)
- ✅ `POST /api/partner/courses` - Create course
- ✅ `GET /api/partner/courses` - Get partner's courses
- ✅ `PUT /api/partner/courses/:id` - Update course
- ✅ `PATCH /api/partner/courses/:id/publish` - Publish course
- ✅ `GET /api/partner/public/course/:id` - Get course (public)
- ✅ `GET /api/partner/public-courses` - Public course listing

### Enrollment & Purchase (6 tests)
- ✅ `POST /api/partner/courses/:id/purchase` - Purchase course
- ✅ `GET /api/partner/my-enrollments` - Get user enrollments
- ✅ `GET /api/partner/enrollment/:enrollmentId` - Get enrollment details
- ✅ `PATCH /api/partner/enrollment/:enrollmentId/progress` - Update progress
- ✅ `GET /api/partner/public/enrollment/student/:studentId` - Get student enrollment
- ✅ `GET /api/partner/courses/:courseId/students` - Get course students

### Sales & Analytics (2 tests)
- ✅ `GET /api/partner/sales` - Get partner's sales
- ✅ `GET /api/partner/learners` - Get partner's learners

### Completed Courses (4 tests)
- ✅ `POST /api/partner/enrollment/:enrollmentId/complete` - Mark complete
- ✅ `GET /api/partner/completed-courses/:userId` - Get user's completed courses
- ✅ `GET /api/partner/public/completed-courses/user/:userId` - Public completed courses
- ✅ `PATCH /api/partner/completed-course/:courseId` - Update completed course

---

## 🐛 Troubleshooting

### Lỗi: "Authentication setup failed"

**Nguyên nhân:** Tài khoản test không tồn tại hoặc mật khẩu sai

**Giải pháp:**
1. Kiểm tra lại email/password trong environment variables
2. Tạo lại tài khoản test (xem phần Chuẩn Bị)

---

### Lỗi: "connect ECONNREFUSED"

**Nguyên nhân:** Backend không chạy

**Giải pháp:**
```bash
cd backend
npm start
```

---

### Lỗi: "Failed to create course"

**Nguyên nhân:** Tài khoản partner không có quyền hoặc thiếu Partner record

**Giải pháp:**
1. Đảm bảo role = "partner" khi đăng ký
2. Hoặc tạo Partner record manually trong database

---

### Lỗi: "Course not found"

**Nguyên nhân:** Test chạy quá nhanh, course chưa được tạo

**Giải pháp:**
- Script đã có delay 500ms giữa các test
- Nếu vẫn lỗi, tăng delay trong code: `const delay = (ms) => new Promise(...)`

---

## 📝 Tùy Chỉnh Tests

### Chỉ Test Một Phần

Chỉnh sửa file `test-partner-api.js`:

```javascript
async function runAllTests() {
  // ... setup code ...

  // Comment out các test suite không cần
  await testApiKeyManagement();
  // await testCourseManagement();
  // await testEnrollmentAndPurchase();
  // await testSalesAndAnalytics();
  // await testCompletedCourses();
}
```

### Thay Đổi Test Data

```javascript
// Trong testCourseManagement()
{
  title: 'My Custom Course',
  description: 'Custom description',
  link: 'https://myplatform.com/course',
  priceEdu: 200,  // Thay đổi giá
}
```

### Thêm Delay Giữa Tests

```javascript
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Trong testEndpoint()
await delay(1000); // Đổi từ 500ms thành 1000ms
```

---

## 🎯 Best Practices

### 1. Chạy Test Trên Database Test Riêng
```env
MONGODB_URI=mongodb://localhost:27017/eduwallet_test
```

### 2. Clean Up Sau Mỗi Test Run
Tạo script cleanup (optional):
```javascript
// scripts/cleanup-test-data.js
const mongoose = require('mongoose');
const Partner = require('../src/models/Partner');
const PartnerCourse = require('../src/models/PartnerCourse');
// ... delete all test data
```

### 3. Chạy Test Trong CI/CD
```yaml
# .github/workflows/test.yml
- name: Test Partner API
  run: |
    cd backend
    npm install
    node scripts/test-partner-api.js
```

---

## 📈 Monitoring & Logging

Script tự động log:
- ✅ Successful requests
- ❌ Failed requests với error details
- 📊 Test statistics
- 🔍 Important IDs (courseId, enrollmentId, etc.)

### Example Log Output:
```
═══════════════════════════════════════════════════════════
🚀 PARTNER API COMPREHENSIVE TEST SUITE
═══════════════════════════════════════════════════════════

ℹ️  Backend URL: http://localhost:5000
ℹ️  Partner Email: partner@test.com
ℹ️  Student Email: student@test.com

═══════════════════════════════════════════════════════════

📋 SETUP: Authentication

ℹ️  Logging in as partner...
✅ Partner login successful
ℹ️  Logging in as student...
✅ Student login successful

═══════════════════════════════════════════════════════════

📋 API KEY MANAGEMENT (4 endpoints)

🧪 Testing: POST /api/partner/apikey/generate
ℹ️  API Key generated: a1b2c3d4e5...
✅ PASSED: POST /api/partner/apikey/generate

...
```

---

## 🆘 Support

Nếu gặp vấn đề:
1. Kiểm tra backend logs: `backend/logs/combined.log`
2. Kiểm tra database connection
3. Review test output để tìm endpoint bị lỗi
4. Tham khảo `PARTNER_API_DOCUMENTATION.md` để xem API specification

---

**Created:** October 30, 2025  
**Author:** EduWallet Development Team  
**Version:** 1.0.0
