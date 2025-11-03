# 📮 Postman Collection - Partner API

## 🚀 Quick Start

### 1. Import Collection vào Postman

1. Mở Postman
2. Click **Import** button (góc trên bên trái)
3. Chọn file `Partner_API.postman_collection.json`
4. Click **Import**

### 2. Cấu Hình Variables

Collection đã có sẵn các variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `baseUrl` | `http://localhost:5000` | Backend URL |
| `partnerToken` | Auto-filled | JWT token (partner) |
| `studentToken` | Auto-filled | JWT token (student) |
| `apiKey` | Auto-filled | Partner API Key |
| `courseId` | Auto-filled | Created course ID |
| `enrollmentId` | Auto-filled | Enrollment ID |
| `userId` | Auto-filled | User ID |
| `completedCourseId` | Auto-filled | Completed course ID |

**Lưu ý:** Các variables sẽ tự động được fill khi bạn chạy các requests theo thứ tự.

### 3. Setup Test Accounts

Trước khi test, tạo 2 tài khoản:

#### Partner Account
```json
POST http://localhost:5000/api/auth/register
{
  "username": "testpartner",
  "email": "partner@test.com",
  "password": "password123",
  "role": "partner"
}
```

#### Student Account
```json
POST http://localhost:5000/api/auth/register
{
  "username": "teststudent",
  "email": "student@test.com",
  "password": "password123",
  "role": "student"
}
```

---

## 🧪 Chạy Tests

### Cách 1: Chạy Từng Request (Recommended)

Chạy theo thứ tự này để tất cả variables được auto-filled:

#### **0. Setup** (Required First!)
1. ✅ **Login Partner** - Lấy partner token
2. ✅ **Login Student** - Lấy student token

#### **1. API Key Management**
3. ✅ Generate API Key
4. ✅ Get API Key Metadata
5. ✅ Reveal API Key
6. ✅ Validate API Key

#### **2. Course Management**
7. ✅ Create Course (saves courseId)
8. ✅ Get Partner's Courses
9. ✅ Update Course
10. ✅ Publish Course
11. ✅ Get Course (Public)
12. ✅ Public Course Listing

#### **3. Enrollment & Purchase**
13. ✅ Purchase Course (saves enrollmentId)
14. ✅ Get My Enrollments
15. ✅ Get Enrollment Details (saves userId)
16. ✅ Update Progress
17. ✅ Get Student Enrollment (Public)
18. ✅ Get Course Students

#### **4. Sales & Analytics**
19. ✅ Get Sales
20. ✅ Get Learners

#### **5. Completed Courses**
21. ✅ Mark Enrollment Complete (saves completedCourseId)
22. ✅ Get User's Completed Courses
23. ✅ Get Completed Courses (Public)
24. ✅ Update Completed Course

---

### Cách 2: Run Entire Collection

1. Click vào collection name "Partner API - EduWallet"
2. Click **Run** button
3. Select all requests
4. Click **Run Partner API - EduWallet**

**⚠️ Warning:** Một số requests phụ thuộc vào kết quả của requests trước, nên nếu chạy toàn bộ có thể bị lỗi.

---

## 📊 Auto-filled Variables

Collection sử dụng **Test Scripts** để tự động lưu variables:

### Login Partner
```javascript
if (pm.response.code === 200) {
    const token = pm.response.json().token;
    pm.collectionVariables.set('partnerToken', token);
}
```

### Generate API Key
```javascript
if (pm.response.code === 200) {
    const apiKey = pm.response.json().data.apiKey;
    pm.collectionVariables.set('apiKey', apiKey);
}
```

### Create Course
```javascript
if (pm.response.code === 201) {
    const courseId = pm.response.json().data.course._id;
    pm.collectionVariables.set('courseId', courseId);
}
```

... và nhiều hơn nữa!

---

## 🔐 Authentication

### JWT Token (Partner Endpoints)

Hầu hết endpoints sử dụng Bearer Token:

```
Authorization: Bearer {{partnerToken}}
```

Collection đã config sẵn auth ở collection level.

### API Key (Public Endpoints)

Public endpoints sử dụng API Key header:

```
X-API-Key: {{apiKey}}
```

---

## 📝 Example Request Bodies

### Create Course
```json
{
  "title": "JavaScript Masterclass 2025",
  "description": "Complete JavaScript course from basics to advanced",
  "link": "https://example.com/courses/js-masterclass",
  "priceEdu": 150
}
```

### Update Progress
```json
{
  "progressPercent": 75,
  "totalPoints": 1200,
  "timeSpentSeconds": 5400,
  "status": "in_progress",
  "metadata": {
    "lastModule": "Module 5",
    "quizScore": 85
  }
}
```

### Mark Complete
```json
{
  "category": "Programming",
  "level": "Advanced",
  "credits": 3,
  "grade": "A",
  "score": 1500,
  "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
  "certificateUrl": "https://example.com/certificates/cert123",
  "verificationUrl": "https://example.com/verify/cert123",
  "modulesCompleted": 10,
  "totalModules": 10
}
```

---

## 🐛 Troubleshooting

### Lỗi: "Unauthorized"

**Nguyên nhân:** Token expired hoặc chưa login

**Giải pháp:** 
1. Chạy lại request **"Login Partner"** hoặc **"Login Student"**
2. Token sẽ tự động được update

---

### Lỗi: "Course not found"

**Nguyên nhân:** `courseId` variable chưa được set

**Giải pháp:**
1. Chạy request **"Create Course"** trước
2. `courseId` sẽ tự động được lưu

---

### Lỗi: "Invalid API Key"

**Nguyên nhân:** `apiKey` variable chưa được set hoặc sai

**Giải pháp:**
1. Chạy request **"Generate API Key"** trước
2. Hoặc chạy **"Reveal API Key"** để lấy key hiện tại

---

### Variables Không Tự Động Fill

**Nguyên nhân:** Test script không chạy hoặc response code không phải 200/201

**Giải pháp:**
1. Check response status code
2. Xem Console log trong Postman (View → Show Postman Console)
3. Manually set variable nếu cần:
   - Click vào collection name
   - Tab **Variables**
   - Set giá trị manually

---

## 📚 Resources

- 📖 **Full API Docs:** `PARTNER_API_DOCUMENTATION.md`
- 🧪 **Test Guide:** `PARTNER_API_TEST_GUIDE.md`
- 🚀 **Quick Reference:** `PARTNER_API_QUICK_REFERENCE.md`
- 📦 **Implementation Summary:** `PARTNER_API_IMPLEMENTATION_COMPLETE.md`

---

## 💡 Tips & Tricks

### 1. Save Responses

Postman tự động save response history. Click vào request → **History** tab để xem.

### 2. Environment Variables

Nếu bạn test trên nhiều environments (dev, staging, prod), tạo Postman Environment:

1. Click **Environments** (sidebar)
2. Create new environment
3. Add variable `baseUrl`
4. Select environment trước khi run

### 3. Pre-request Scripts

Collection có sẵn Test Scripts. Bạn có thể thêm Pre-request Scripts nếu cần:

```javascript
// Example: Add timestamp to request
pm.variables.set("timestamp", Date.now());
```

### 4. Export Variables

Xuất variables ra file JSON:
1. Click collection → **Variables**
2. Click **...** → **Export**

---

## 🎯 Collection Structure

```
Partner API - EduWallet
├── 0. Setup (2 requests)
│   ├── Login Partner
│   └── Login Student
├── 1. API Key Management (4 requests)
├── 2. Course Management (6 requests)
├── 3. Enrollment & Purchase (6 requests)
├── 4. Sales & Analytics (2 requests)
└── 5. Completed Courses (4 requests)

Total: 24 requests
```

---

**Happy Testing! 🚀**
