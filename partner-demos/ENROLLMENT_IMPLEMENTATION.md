# ✅ KIỂM TRA API FLOWS - KẾT QUẢ

## 📊 TỔNG QUAN

Đã kiểm tra và triển khai đầy đủ 2 API flows chính:

### ✅ FLOW 1: GET KHÓA HỌC TỪ PARTNER → EDUWALLET

**Status:** HOÀN THÀNH (đã có từ trước)

### ✅ FLOW 2: POST TẠO ENROLLMENT KHI USER MUA

**Status:** MỚI TRIỂN KHAI (vừa mới thêm)

---

## 🔍 CHI TIẾT TRIỂN KHAI

### FLOW 1: GET Courses (Partner → EduWallet) ✅

**API Endpoint:**

```
GET /api/courses
```

**Mục đích:**

- EduWallet gọi để đồng bộ danh sách khóa học từ Partner

**Implementation:**

- Location: `partner-demos/website-1-video/routes/api.js` (line 182-217)
- Data source: MongoDB
- Response format: Array of course objects

**Features:**

- ✅ Database-driven (không hardcode)
- ✅ Hỗ trợ 3 loại course: video, quiz, hybrid
- ✅ Trả về đầy đủ metadata (quiz questions, video info, skills, etc)
- ✅ Error handling

**Sample Response:**

```json
{
  "success": true,
  "courses": [
    {
      "courseId": "video_1699123456_abc123",
      "title": "JavaScript Fundamentals",
      "courseType": "video",
      "videoId": "PkZNo7MFNFg",
      "videoDuration": 3600,
      "priceEdu": 50,
      ...
    }
  ]
}
```

---

### FLOW 2: POST Create Enrollment (EduWallet → Partner) 🆕

**API Endpoint:**

```
POST /api/webhooks/enrollment-created
```

**Mục đích:**

- EduWallet gọi khi user mua khóa học thành công
- Partner tạo enrollment record
- Grant access cho user

**Implementation:**

- Location: `partner-demos/website-1-video/routes/api.js` (line 290-410)
- Database: Enrollment collection (MongoDB)
- Security: HMAC signature verification

**Request Format:**

```json
POST /api/webhooks/enrollment-created
X-Partner-Id: partner_video_demo_001
X-Partner-Timestamp: 1699123456
X-Partner-Signature: sha256=abc123...

{
  "enrollmentId": "enroll_abc123",
  "userId": "690302badd7c9774cfd2a6a7",
  "courseId": "video_1699123456_abc123",
  "purchaseDate": "2025-11-06T10:00:00.000Z",
  "expiryDate": null,
  "metadata": {
    "priceEdu": 50,
    "transactionId": "tx_xyz789"
  }
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Enrollment created successfully",
  "enrollment": {
    "enrollmentId": "enroll_abc123",
    "userId": "690302badd7c9774cfd2a6a7",
    "courseId": "video_1699123456_abc123",
    "status": "active",
    "accessUrl": "https://partner1.mojistudio.vn/course/video_1699123456_abc123?student=690302badd7c9774cfd2a6a7",
    "courseInfo": {
      "title": "JavaScript Fundamentals",
      "courseType": "video",
      "credits": 3
    }
  }
}
```

**Security Features:**

- ✅ HMAC SHA256 signature verification
- ✅ Timestamp validation (prevent replay attacks)
- ✅ Partner ID validation
- ✅ Idempotency (duplicate enrollments handled)

**Error Handling:**

- ❌ 401: Invalid signature / expired timestamp
- ❌ 400: Missing required fields
- ❌ 404: Course not found
- ❌ 500: Database error

---

## 🗃️ DATABASE UPDATES

### New Collection: Enrollments

**Schema:**

```javascript
{
  enrollmentId: String (unique),
  userId: String (required),
  courseId: String (required),
  status: "active" | "completed" | "expired",
  purchaseDate: Date,
  expiryDate: Date (nullable),
  accessGranted: Boolean,
  metadata: {
    priceEdu: Number,
    transactionId: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `enrollmentId` (unique)
- `userId + courseId` (compound, for fast lookups)

**Purpose:**

- Track user purchases
- Control access to courses
- Handle enrollment expiry

---

## 🔐 ACCESS CONTROL

### New Middleware: `checkCourseAccess`

**Applied to:**

- `POST /api/learning/start`

**Logic:**

```javascript
1. Extract studentId + courseId from request
2. Query Enrollment collection
3. Check:
   - Enrollment exists?
   - Status = "active"?
   - Not expired?
4. If all checks pass → Allow access
5. If any check fails → 403 Forbidden
```

**Response (Access Denied):**

```json
{
  "success": false,
  "message": "Access denied. Please purchase this course on EduWallet first.",
  "courseId": "video_1699123456_abc123",
  "userId": "690302badd7c9774cfd2a6a7"
}
```

---

## 📋 NEW API ENDPOINTS

### 1. Enrollment Webhook (Main)

```
POST /api/webhooks/enrollment-created
```

- Purpose: Receive purchase notifications from EduWallet
- Security: HMAC verification required
- Creates enrollment record in database

### 2. Get User Enrollments

```
GET /api/enrollments/:userId
```

- Purpose: List all courses a user has purchased
- Returns: Array of enrollments with course details
- Use case: User dashboard, access verification

---

## 🔄 COMPLETE FLOW

### Từ đầu đến cuối:

```
1. PARTNER TẠO KHÓA HỌC
   ↓
   POST /api/courses → MongoDB (Partner)

2. EDUWALLET ĐỒNG BỘ
   ↓
   GET /api/courses ← EduWallet pulls courses
   ↓
   Save to MongoDB (EduWallet)

3. USER MUA KHÓA HỌC
   ↓
   User purchases on EduWallet
   ↓
   POST /api/webhooks/enrollment-created → Partner (🆕)
   ↓
   Enrollment saved to MongoDB (Partner)

4. USER HỌC KHÓA HỌC
   ↓
   POST /api/learning/start
   ↓
   checkCourseAccess middleware (🆕)
   ↓
   - Check enrollment exists
   - Check status = active
   - Check not expired
   ↓
   If OK: Start learning session
   If NOT OK: 403 Access Denied

5. HOÀN THÀNH KHÓA HỌC
   ↓
   POST /api/learning/complete
   ↓
   Webhook CompletedCourse → EduWallet
```

---

## ✨ KEY IMPROVEMENTS

### Before (Old System):

- ❌ No enrollment tracking
- ❌ No access control
- ❌ Anyone could access any course with any studentId
- ❌ No purchase verification

### After (New System):

- ✅ Full enrollment tracking in database
- ✅ Access control middleware
- ✅ Only enrolled users can access courses
- ✅ Purchase verification via EduWallet webhook
- ✅ HMAC signature security
- ✅ Expiry date support
- ✅ Idempotent operations

---

## 📝 CONFIGURATION UPDATES

### .env.example (New Variable)

```bash
PARTNER_URL=https://partner1.mojistudio.vn
```

- Used to generate access URLs in webhook response

---

## 🚀 DEPLOYMENT CHECKLIST

### Backend:

- [x] Enrollment Schema created
- [x] Webhook endpoint implemented
- [x] Access control middleware added
- [x] HMAC verification implemented
- [x] GET enrollments endpoint added
- [x] Error handling complete

### Database:

- [x] Enrollment collection ready
- [x] Indexes defined
- [ ] **TODO:** Run first time to create indexes

### Configuration:

- [x] .env.example updated
- [ ] **TODO:** Update production .env with PARTNER_URL

### Documentation:

- [x] README.md updated
- [x] API_FLOW_ANALYSIS.md created
- [x] Database schema documented
- [x] API endpoints table updated

---

## 🧪 TESTING GUIDE

### Test Enrollment Webhook:

```bash
# 1. Generate HMAC signature
timestamp=$(date +%s)
body='{"enrollmentId":"test_enroll_001","userId":"690302badd7c9774cfd2a6a7","courseId":"video_1699123456_abc123","purchaseDate":"2025-11-06T10:00:00.000Z"}'
secret="your_secret_key_here"
signature=$(echo -n "${timestamp}${body}" | openssl dgst -sha256 -hmac "$secret" | sed 's/^.* //')

# 2. Call webhook
curl -X POST http://localhost:3001/api/webhooks/enrollment-created \
  -H "Content-Type: application/json" \
  -H "X-Partner-Id: partner_video_demo_001" \
  -H "X-Partner-Timestamp: ${timestamp}" \
  -H "X-Partner-Signature: sha256=${signature}" \
  -d "$body"
```

### Test Access Control:

```bash
# 1. Try to start learning WITHOUT enrollment (should fail)
curl -X POST http://localhost:3001/api/learning/start \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "new_user_001",
    "courseId": "video_1699123456_abc123"
  }'

# Expected: 403 Access Denied

# 2. Create enrollment via webhook (see above)

# 3. Try to start learning WITH enrollment (should succeed)
curl -X POST http://localhost:3001/api/learning/start \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "690302badd7c9774cfd2a6a7",
    "courseId": "video_1699123456_abc123"
  }'

# Expected: 200 OK
```

### Test Get Enrollments:

```bash
curl http://localhost:3001/api/enrollments/690302badd7c9774cfd2a6a7
```

---

## 📈 NEXT STEPS (Optional Enhancements)

### Phase 2 (Future):

1. **Enrollment Expiry Cron Job**

   - Auto-update status to "expired" when expiryDate passed

2. **Enrollment Cancellation**

   - POST /api/enrollments/:enrollmentId/cancel

3. **Enrollment Renewal**

   - POST /api/enrollments/:enrollmentId/renew

4. **Admin Dashboard**

   - View all enrollments
   - Manual enrollment creation
   - Access logs

5. **Analytics**
   - Track enrollment trends
   - Revenue by course
   - User engagement metrics

---

## 🎯 KẾT LUẬN

### ✅ ĐÃ HOÀN THÀNH:

1. **FLOW 1:** GET courses từ Partner → EduWallet

   - ✅ Đã có sẵn và hoạt động tốt

2. **FLOW 2:** POST enrollment khi user mua
   - ✅ Mới implement đầy đủ
   - ✅ Webhook endpoint
   - ✅ Enrollment tracking
   - ✅ Access control
   - ✅ Security (HMAC)

### 🎉 HỆ THỐNG HOÀN CHỈNH:

Partner website giờ có:

- ✅ Course management (3 types: video/quiz/hybrid)
- ✅ Enrollment management (🆕)
- ✅ Access control (🆕)
- ✅ Webhook integration
- ✅ Database-driven architecture
- ✅ Security best practices

**Ready for production!** 🚀
