# Test Webhook Script

Script này giúp test webhook endpoint của EduWallet để đảm bảo partner websites có thể gửi dữ liệu CompletedCourse thành công.

## 🔧 Cài đặt

```bash
# Trong folder partner-demos
npm install axios
```

## 📝 Cấu hình

Mở file `test-webhook.js` và cập nhật:

```javascript
const EDUWALLET_API_URL = 'http://localhost:5000'; // Hoặc production URL
const PARTNER_ID = 'your_partner_id_here'; // Partner ID từ database
const PARTNER_SECRET = 'your_partner_secret_here'; // Secret key từ database
```

### Lấy Partner ID và Secret

#### Option 1: Từ database
```javascript
// Kết nối MongoDB và query
db.partners.findOne({ username: 'partner_name' })
// Lấy _id và apiSecretKey
```

#### Option 2: Tạo partner mới (nếu chưa có)
```bash
# Vào backend
cd backend

# Chạy script tạo partner
node -e "
const mongoose = require('mongoose');
const Partner = require('./src/models/Partner');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const partner = new Partner({
    username: 'demo_partner',
    email: 'partner@demo.com',
    password: 'password123',
    name: 'Demo Partner',
    domain: 'http://localhost:3001',
    apiSecretKey: 'demo_secret_key_12345',
    apiEndpoints: {}
  });
  await partner.save();
  console.log('Partner created:', partner._id);
  console.log('Secret:', partner.apiSecretKey);
  process.exit(0);
});
"
```

## 🚀 Chạy test

```bash
node test-webhook.js
```

## ✅ Kết quả mong đợi

### Success Response
```json
{
  "success": true
}
```

### Kiểm tra database
```javascript
// CompletedCourse đã được tạo
db.completedcourses.find({ name: "Test Course - Lập trình Web cơ bản" })

// Enrollment đã được cập nhật (nếu có)
db.enrollments.find({ status: "completed" })
```

## ❌ Troubleshooting

### Lỗi 401 - Invalid signature
- Kiểm tra `PARTNER_SECRET` có đúng không
- Kiểm tra partner ID có tồn tại trong database không

### Lỗi 401 - Request too old
- Timestamp quá xa (>300 giây)
- Kiểm tra đồng hồ máy tính

### Lỗi 400 - Missing partner id
- Header `X-Partner-Id` không được gửi
- Kiểm tra PARTNER_ID

### Lỗi - User not found
- StudentId không tồn tại trong database
- Thay bằng user ID thật từ `users` collection

## 📊 Test với real data

Để test với dữ liệu thật:

1. Lấy user ID từ database:
```javascript
db.users.findOne({}, { _id: 1 })
```

2. Cập nhật trong test script:
```javascript
const testPayload = {
  ...
  studentId: 'real_user_id_here', // ID từ bước 1
  ...
}
```

3. Chạy lại test

## 🔍 Debug logs

Backend sẽ log:
```
CompletedCourse created for user xxx: Test Course - Lập trình Web cơ bản
```

Hoặc nếu đã tồn tại:
```
CompletedCourse updated for user xxx: Test Course - Lập trình Web cơ bản
```
