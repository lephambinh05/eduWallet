# Partner Demo Websites - Complete Setup Summary

## ✅ Đã hoàn thành

### 1. 📁 Cấu trúc Project
```
partner-demos/
├── README.md                          # Tổng quan
├── SETUP_GUIDE.md                     # Hướng dẫn chi tiết
├── COMPLETED_COURSE_FORMAT.md         # Tài liệu format API
├── TEST_WEBHOOK_README.md             # Hướng dẫn test webhook
├── install-all.bat                    # Script cài đặt
├── start-all-demos.bat                # Script chạy tất cả
├── test-webhook.js                    # Script test webhook
│
├── website-1-video/                   # ✅ Video Learning Platform
│   ├── package.json
│   ├── .env                          # ✅ Đã tạo
│   ├── server.js
│   ├── routes/api.js                 # ✅ Updated với CompletedCourse format
│   └── public/index.html
│
├── website-2-quiz/                    # ✅ Quiz Platform  
│   ├── package.json
│   ├── .env                          # ✅ Đã tạo
│   ├── server.js
│   ├── routes/api.js                 # ✅ Updated với CompletedCourse format
│   └── public/index.html
│
└── website-3-hybrid/                  # ✅ Hybrid Platform
    ├── package.json
    ├── .env                          # ✅ Đã tạo
    ├── server.js
    ├── routes/api.js                 # ✅ Updated với CompletedCourse format
    └── public/index.html
```

### 2. 🔧 Backend Integration

✅ **Webhook Handler Updated**: `backend/src/routes/webhooks.js`
- Nhận `eventType: "course_completed"`
- Verify HMAC signature
- Tạo CompletedCourse record
- Cập nhật Enrollment (nếu có)

✅ **Models**:
- `CompletedCourse` model đã có (từ pull mới)
- `Partner`, `Enrollment`, `User` models đã có

### 3. 🎯 Features Implemented

#### Website 1 - Video Learning
- ✅ YouTube video player integration
- ✅ Auto progress tracking (mỗi 5 giây)
- ✅ Score calculation based on watch percentage
- ✅ HMAC-SHA256 signature
- ✅ CompletedCourse format

#### Website 2 - Quiz Platform
- ✅ 2 tasks × 5 questions each
- ✅ Auto scoring
- ✅ Grade calculation (A+, A, B+, B, C, D)
- ✅ HMAC-SHA256 signature
- ✅ CompletedCourse format

#### Website 3 - Hybrid
- ✅ Task 1: Video (8 minutes)
- ✅ Task 2: Quiz (5 questions)
- ✅ Combined progress tracking
- ✅ HMAC-SHA256 signature
- ✅ CompletedCourse format

## 🚀 Quick Start Guide

### Step 1: Install Dependencies
```bash
cd partner-demos
install-all.bat
```

### Step 2: Configure Environment
File `.env` đã được tạo cho cả 3 websites với giá trị mặc định:
```env
PORT=3001  # (hoặc 3002, 3003)
PARTNER_ID=partner_xxx_xxx
PARTNER_SECRET=your_secret_key_here
EDUWALLET_API_URL=https://api-eduwallet.mojistudio.vn
EDUWALLET_WEBHOOK_ENDPOINT=/api/webhooks/partner-updates
```

**⚠️ Cần cập nhật:**
- `PARTNER_ID`: Lấy từ database hoặc tạo mới
- `PARTNER_SECRET`: Phải khớp với `apiSecretKey` trong Partner record

### Step 3: Start Websites
```bash
start-all-demos.bat
```

Hoặc chạy từng website:
```bash
# Website 1
cd website-1-video
npm start

# Website 2  
cd website-2-quiz
npm start

# Website 3
cd website-3-hybrid
npm start
```

### Step 4: Test
- Website 1: http://localhost:3001
- Website 2: http://localhost:3002
- Website 3: http://localhost:3003

## 🔐 Security Implementation

### HMAC Signature
Tất cả websites đều implement HMAC-SHA256:

```javascript
const crypto = require('crypto');
const timestamp = Math.floor(Date.now() / 1000).toString();
const body = JSON.stringify(payload);
const secret = process.env.PARTNER_SECRET;
const hmac = crypto.createHmac('sha256', secret)
  .update(timestamp + body)
  .digest('hex');
const signature = `sha256=${hmac}`;
```

### Headers Required
```
Content-Type: application/json
X-Partner-Id: <partner_id>
X-Partner-Timestamp: <unix_timestamp>
X-Partner-Signature: sha256=<hex_hmac>
```

### Backend Verification
- ✅ Signature verification
- ✅ Timestamp validation (±300 seconds)
- ✅ Partner ID validation

## 📊 Data Flow

```
Partner Website → CompletedCourse Data → Webhook → Backend
                                                        ↓
                                              Verify Signature
                                                        ↓
                                              Create/Update User
                                                        ↓
                                              Update Enrollment
                                                        ↓
                                              Create CompletedCourse
                                                        ↓
                                              Return Success
```

## 📝 CompletedCourse Format

```json
{
  "partnerId": "partner_xxx",
  "eventType": "course_completed",
  "studentId": "user_id",
  "courseId": "course_id",
  "enrollmentId": "enrollment_id or null",
  "completedCourse": {
    "name": "Course Name",
    "description": "Course Description",
    "issuer": "Issuer Name",
    "issueDate": "2025-10-30T...",
    "expiryDate": null,
    "category": "Programming",
    "level": "Beginner|Intermediate|Advanced",
    "credits": 3,
    "grade": "A+|A|B+|B|C|D",
    "score": 95,
    "status": "Completed",
    "progress": 100,
    "modulesCompleted": 10,
    "totalModules": 10,
    "skills": ["Skill1", "Skill2"],
    "verificationUrl": null,
    "certificateUrl": null,
    "imageUrl": null
  }
}
```

## 🧪 Testing

### Test Webhook Endpoint
```bash
cd partner-demos
node test-webhook.js
```

### Manual Testing Flow

1. **Website 1**:
   - Nhập Student ID
   - Xem video (auto progress)
   - Click "Hoàn thành khóa học"
   - ✅ Kiểm tra CompletedCourse trong database

2. **Website 2**:
   - Nhập Student ID
   - Làm Task 1 (5 câu hỏi)
   - Làm Task 2 (5 câu hỏi)
   - Click "Gửi kết quả đến EduWallet"
   - ✅ Kiểm tra CompletedCourse trong database

3. **Website 3**:
   - Nhập Student ID
   - Task 1: Xem video
   - Task 2: Làm quiz
   - Click "Gửi kết quả đến EduWallet"
   - ✅ Kiểm tra CompletedCourse trong database

## 📚 Documentation Files

1. **README.md**: Tổng quan về 3 websites
2. **SETUP_GUIDE.md**: Hướng dẫn cài đặt và sử dụng chi tiết
3. **COMPLETED_COURSE_FORMAT.md**: Chi tiết format API và payload
4. **TEST_WEBHOOK_README.md**: Hướng dẫn test webhook

## 🔧 Configuration Checklist

Backend:
- [x] CompletedCourse model
- [x] Webhook endpoint (`/api/webhooks/partner-updates`)
- [x] Signature verification
- [x] Timestamp validation
- [x] Event handler for `course_completed`
- [x] Create CompletedCourse logic
- [x] Update Enrollment logic

Partner Websites:
- [x] Website 1 setup
- [x] Website 2 setup
- [x] Website 3 setup
- [x] .env files created
- [x] HMAC signature implementation
- [x] CompletedCourse format
- [x] Error handling

## 🎓 Next Steps

### For Development:
1. Cập nhật `PARTNER_ID` và `PARTNER_SECRET` trong `.env`
2. Chạy backend (`cd backend && npm start`)
3. Chạy websites (`start-all-demos.bat`)
4. Test từng website
5. Verify data trong database

### For Production:
1. Tạo Partner record trong database
2. Generate API key và secret
3. Cập nhật `.env` với production values
4. Deploy websites
5. Configure production URL trong `.env`
6. Test production webhook
7. Monitor logs

## 📞 Troubleshooting

### Issue: 401 Invalid signature
**Solution**: Kiểm tra `PARTNER_SECRET` khớp với database

### Issue: User not found
**Solution**: Sử dụng user ID thật từ database

### Issue: Webhook không nhận được data
**Solution**: 
1. Kiểm tra backend đang chạy
2. Kiểm tra URL trong `.env`
3. Check network/firewall

### Issue: CompletedCourse không được tạo
**Solution**:
1. Check backend logs
2. Verify payload format
3. Test với `test-webhook.js`

## 🎉 Success Criteria

✅ Tất cả 3 websites chạy được
✅ Gửi được dữ liệu đến webhook
✅ Signature được verify thành công
✅ CompletedCourse được tạo trong database
✅ Enrollment được cập nhật (nếu có)
✅ User có thể xem completed courses

---

**Status**: ✅ READY FOR TESTING

**Last Updated**: October 30, 2025
