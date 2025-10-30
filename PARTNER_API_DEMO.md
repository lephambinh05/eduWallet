PARTNER API DEMO — EduWallet

Mục đích

Tài liệu này mô tả các demo partner websites (3 website) và cách EduWallet / partner tích hợp qua API và webhooks. Bao gồm: payload mẫu khi EduWallet lấy kết quả khóa học, quy tắc ký webhook (HMAC-SHA256), ví dụ curl/Node cho gửi và xác thực payload.

Tổng quan demo websites

Website 1

- Chức năng: Xem video YouTube, tính tiến trình, tính điểm.
- Khi học viên hoàn thành, website gửi hoặc EduWallet sẽ lấy (pull) kết quả: progress, score, status, thông tin khóa học.

Website 2

- Chức năng: Quiz (2 tasks × 5 câu mỗi task), tính tiến trình và điểm.
- Kết quả quiz được gửi/đồng bộ lên EduWallet.

Website 3

- Chức năng: Task 1: xem video; Task 2: 5 câu quiz. Tính tiến trình và điểm, sau đó sync với EduWallet.

Endpoint chính (EduWallet nhận dữ liệu từ partner)

- POST /api/webhooks/partner-updates
  - Mục đích: partner gửi kết quả học/tiến trình/điểm để EduWallet tạo/ cập nhật enrollment và chứng nhận.
  - Content-Type: application/json
  - Headers (bắt buộc):
    - X-Partner-Id: <partner_id>
    - X-Partner-Timestamp: <unix_seconds>
    - X-Partner-Signature: sha256=<hex_hmac>

Quy tắc ký (Partner → EduWallet)

- Thuật toán: HMAC-SHA256
- Dữ liệu được ký: ascii string = `${timestamp}${rawBody}` (timestamp là giá trị trong X-Partner-Timestamp, rawBody là chính xác JSON body) — concat không có dấu phân cách.
- Header: X-Partner-Signature: sha256=<hex> (hex chữ thường)
- Acceptable drift: ±300 giây so với server time.
- Kiểm tra: server phải reject nếu signature không khớp hoặc timestamp quá xa.

Payload mẫu (khi gửi kết quả khóa học)

- Schema gợi ý (mở rộng theo nhu cầu):
  {
  "partnerId": "<partner*id>",
  "eventType": "course_result", // hoặc "progress_update", "certificate_issued"
  "studentId": "<user_id_on_partner>",
  "courseId": "<course_id_on_partner>",
  "course": { ... }, // optional: metadata về khóa học
  "results": {
  "progress": 100,
  "status": "Completed",
  "score": 98,
  "grade": "A+",
  "modulesCompleted": 10,
  "totalModules": 10,
  "issuedAt": "2025-10-13T12:26:26.785Z"
  },
  "attachments": { /* optional \_/ }
  }

Ví dụ thực tế (từ file bạn cung cấp)

"courses": [
{
"\_id": "68eceff2fc4d8abe6135da87",
"name": "Cơ sở dữ liệu",
"description": "Khóa học về thiết kế và quản lý cơ sở dữ liệu",
"issuer": "Đại học Công nghệ Thông tin",
"issueDate": "2024-01-15T00:00:00.000Z",
"expiryDate": null,
"category": "Programming",
"level": "Intermediate",
"userId": "68ecef57f2d3ddc8fd99e5be",
"credits": 3,
"grade": "A+",
"score": 98,
"status": "Completed",
"progress": 100,
"modulesCompleted": 0,
"totalModules": 0,
"skills": ["SQL","Database Design","MySQL","PostgreSQL"],
"verificationUrl": null,
"certificateUrl": null,
"imageUrl": null,
"createdAt": "2025-10-13T12:26:26.785Z",
"updatedAt": "2025-10-13T12:26:26.785Z",
"issueDateFormatted": "15/1/2024",
"expiryDateFormatted": null,
"scoreDisplay": "98%",
"id": "68eceff2fc4d8abe6135da87"
}
]

Gửi request mẫu (curl)

# chuẩn bị payload.json

curl -X POST "https://api-eduwallet.mojistudio.vn/api/webhooks/partner-updates" \
 -H "Content-Type: application/json" \
 -H "X-Partner-Id: <partner_id>" \
 -H "X-Partner-Timestamp: <timestamp>" \
 -H "X-Partner-Signature: sha256=<hex_hmac>" \
 -d @payload.json

Tạo signature (bash / node)

# Bash (openssl)

TIMESTAMP=$(date +%s)
BODY=$(cat payload.json)
SECRET="your_partner_secret_here"
SIGNATURE=$(printf "%s%s" "$TIMESTAMP" "$BODY" | openssl dgst -sha256 -hmac "$SECRET" -hex | sed 's/^.\* //')

# Header: X-Partner-Signature: sha256=$SIGNATURE

# Node example (compute HMAC)

const crypto = require('crypto');
const timestamp = Math.floor(Date.now() / 1000).toString();
const body = JSON.stringify(payload);
const secret = process.env.PARTNER_SECRET;
const hmac = crypto.createHmac('sha256', secret).update(timestamp + body).digest('hex');
const signature = `sha256=${hmac}`;

EduWallet → Partner (Outgoing calls)

Khi EduWallet gọi partner để đồng bộ hoặc lấy chi tiết, headers sau được dùng:

- Authorization: Bearer <partner.apiKey>
- X-EduWallet-Timestamp: <unix_ts>
- X-EduWallet-Signature: sha256=<hex> (HMAC SHA256 sử dụng partner.apiSecretKey, trên server EduWallet)

Ví dụ: EduWallet gọi 1 endpoint partner để cập nhật tiến trình /xact

- Method: POST
- Header: Authorization: Bearer <partner.apiKey>
- Body: { studentId, courseId, progress, score, status }

API key usage & endpoints public

- Public read (no JWT):
  - GET /api/partner/public/course/:id (accepts x-api-key header or ?apikey=)
  - GET /api/partner/apikey/validate (accepts x-api-key header or ?apikey=)
  - GET /api/partner/public/enrollment/student/:studentId (accepts x-api-key header or ?apikey=)

---

## DANH SÁCH ĐẦY ĐỦ PARTNER API ENDPOINTS

### 🔑 Quản lý API Key

#### 1. GET /api/partner/apikey

- **Mô tả**: Lấy metadata của API key (không trả về key thật)
- **Auth**: JWT (Partner)
- **Response**: `{ exists, maskedKey, createdAt, rotatedAt }`

#### 2. POST /api/partner/apikey/generate

- **Mô tả**: Tạo mới hoặc đổi API key
- **Auth**: JWT (Partner)
- **Body**: `{ password }` (required nếu đã có key)
- **Response**: `{ apiKey, createdAt, rotatedAt }`

#### 3. POST /api/partner/apikey/reveal

- **Mô tả**: Hiển thị API key đầy đủ
- **Auth**: JWT (Partner)
- **Response**: `{ apiKey, createdAt, rotatedAt }`

#### 4. GET /api/partner/apikey/validate

- **Mô tả**: Validate API key và trả về thông tin partner
- **Auth**: API Key (X-Partner-API-Key header hoặc ?apikey=)
- **Response**: `{ partner: { _id, name, domain, supportedFeatures } }`

### 📚 Quản lý Khóa học

#### 5. GET /api/partner/courses

- **Mô tả**: Lấy danh sách khóa học của partner
- **Auth**: JWT (Partner)
- **Response**: `{ courses: [...] }`

#### 6. POST /api/partner/courses

- **Mô tả**: Tạo khóa học mới
- **Auth**: JWT (Partner)
- **Body**: `{ title, description, link, priceEdu }`
- **Response**: `{ course }`

#### 7. PATCH /api/partner/courses/:id/publish

- **Mô tả**: Publish/unpublish khóa học
- **Auth**: JWT (Partner)
- **Body**: `{ publish: true/false }`
- **Response**: `{ course }`

#### 8. GET /api/partner/public/course/:id

- **Mô tả**: Lấy thông tin chi tiết 1 khóa học
- **Auth**: API Key
- **Response**: `{ partner, course }`

#### 9. GET /api/partner/public-courses

- **Mô tả**: Danh sách public courses (có search, pagination)
- **Auth**: None
- **Query**: `?page=1&limit=24&q=search_term`
- **Response**: `{ total, courses }`

#### 10. POST /api/partner/courses/:id/purchase

- **Mô tả**: Mua khóa học (tự động tạo enrollment)
- **Auth**: JWT (User)
- **Body**: `{ metadata: {...} }` (optional)
- **Response**: `{ purchase, enrollment }`
- **Note**: Tự động tạo Purchase và Enrollment, gửi email thông báo

### 💰 Doanh số & Học viên

#### 11. GET /api/partner/sales

- **Mô tả**: Lấy danh sách đơn hàng đã bán
- **Auth**: JWT (Partner)
- **Query**: `?page=1&limit=100`
- **Response**: `{ total, sales }`

#### 12. GET /api/partner/learners

- **Mô tả**: Lấy danh sách học viên (enrollments)
- **Auth**: JWT (Partner)
- **Query**: `?page=1&limit=50`
- **Response**: `{ total, learners }`

#### 13. GET /api/partner/my-enrollments

- **Mô tả**: Lấy danh sách khóa học đã mua của user hiện tại
- **Auth**: JWT (User)
- **Query**: `?page=1&limit=50`
- **Response**: `{ total, enrollments }`

### 📊 Quản lý Tiến trình Học viên (MỚI)

#### 14. GET /api/partner/enrollment/:enrollmentId

- **Mô tả**: Lấy chi tiết enrollment và tiến trình học tập
- **Auth**: JWT (Partner)
- **Response**:

```json
{
  "success": true,
  "data": {
    "enrollment": {
      "_id": "...",
      "user": { "username", "email", "firstName", "lastName" },
      "itemId": { "title", "link", "priceEdu" },
      "seller": { "username", "email" },
      "purchase": { "total", "createdAt" },
      "progressPercent": 75,
      "totalPoints": 850,
      "timeSpentSeconds": 3600,
      "status": "in_progress",
      "completedAt": null,
      "lastAccessed": "2025-10-30T...",
      "metadata": { ... }
    }
  }
}
```

#### 15. PATCH /api/partner/enrollment/:enrollmentId/progress

- **Mô tả**: Cập nhật tiến trình học tập của học viên
- **Auth**: JWT (Partner)
- **Body**:

```json
{
  "progressPercent": 85,
  "totalPoints": 950,
  "timeSpentSeconds": 4200,
  "status": "in_progress",
  "metadata": {
    "lastModule": "Module 5",
    "quizScores": [90, 85, 95]
  }
}
```

- **Response**: `{ success: true, message: "Progress updated", data: { enrollment } }`
- **Note**:
  - Tự động set `completedAt` khi status = "completed"
  - Cập nhật `lastAccessed` timestamp

#### 16. GET /api/partner/courses/:courseId/students

- **Mô tả**: Xem danh sách học viên trong 1 khóa học cụ thể
- **Auth**: JWT (Partner)
- **Query**: `?page=1&limit=50`
- **Response**:

```json
{
  "success": true,
  "data": {
    "course": { "_id", "title" },
    "total": 150,
    "students": [
      {
        "_id": "enrollment_id",
        "user": { "username", "email", "firstName", "lastName" },
        "purchase": { "total", "createdAt" },
        "progressPercent": 60,
        "totalPoints": 750,
        "timeSpentSeconds": 2500,
        "status": "in_progress",
        "lastAccessed": "2025-10-30T..."
      }
    ]
  }
}
```

#### 17. GET /api/partner/public/enrollment/student/:studentId

- **Mô tả**: Lấy thông tin enrollment của học viên (dùng API key)
- **Auth**: API Key (X-Partner-API-Key)
- **Query**: `?courseId=xxx` (optional - lọc theo khóa học)
- **Response**:

```json
{
  "success": true,
  "data": {
    "partner": { "_id", "name" },
    "enrollments": [
      {
        "_id": "...",
        "user": { "username", "email" },
        "itemId": { "title", "link" },
        "purchase": { "total", "createdAt" },
        "progressPercent": 100,
        "totalPoints": 1000,
        "status": "completed",
        "completedAt": "2025-10-25T..."
      }
    ]
  }
}
```

### Ví dụ Use Cases

#### Use Case 1: Partner Website cập nhật tiến trình học viên

```bash
# Bước 1: Lấy enrollment ID từ studentId
curl -H "X-Partner-API-Key: YOUR_API_KEY" \
  "https://api-eduwallet.mojistudio.vn/api/partner/public/enrollment/student/USER_ID?courseId=COURSE_ID"

# Bước 2: Đăng nhập partner và cập nhật progress
curl -X PATCH \
  -H "Authorization: Bearer PARTNER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "progressPercent": 90,
    "totalPoints": 950,
    "timeSpentSeconds": 5400,
    "status": "in_progress",
    "metadata": {
      "currentModule": "Module 8/10",
      "lastQuizScore": 95
    }
  }' \
  "https://api-eduwallet.mojistudio.vn/api/partner/enrollment/ENROLLMENT_ID/progress"
```

#### Use Case 2: Partner xem danh sách học viên và tiến trình

```bash
# Xem tất cả học viên trong khóa học
curl -H "Authorization: Bearer PARTNER_JWT_TOKEN" \
  "https://api-eduwallet.mojistudio.vn/api/partner/courses/COURSE_ID/students?page=1&limit=50"
```

#### Use Case 3: Học viên hoàn thành khóa học

```bash
# Partner cập nhật status = completed
curl -X PATCH \
  -H "Authorization: Bearer PARTNER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "progressPercent": 100,
    "totalPoints": 1000,
    "status": "completed"
  }' \
  "https://api-eduwallet.mojistudio.vn/api/partner/enrollment/ENROLLMENT_ID/progress"
```

---

### 📚 Quản lý Khóa học Hoàn thành (Completed Courses)

#### 18. GET /api/partner/completed-courses/:userId

- **Mô tả**: Lấy danh sách khóa học đã hoàn thành của user
- **Auth**: JWT (Partner)
- **Query**: `?page=1&limit=50`
- **Response**:

```json
{
  "success": true,
  "data": {
    "total": 5,
    "page": 1,
    "limit": 50,
    "courses": [
      {
        "_id": "...",
        "enrollmentId": "...",
        "userId": "...",
        "name": "Cơ sở dữ liệu",
        "description": "Khóa học về thiết kế và quản lý cơ sở dữ liệu",
        "issuer": "Đại học Công nghệ Thông tin",
        "issueDate": "2024-01-15T00:00:00.000Z",
        "expiryDate": null,
        "category": "Programming",
        "level": "Intermediate",
        "credits": 3,
        "grade": "A+",
        "score": 98,
        "status": "Completed",
        "progress": 100,
        "modulesCompleted": 10,
        "totalModules": 10,
        "skills": ["SQL", "Database Design", "MySQL", "PostgreSQL"],
        "verificationUrl": null,
        "certificateUrl": "https://...",
        "imageUrl": null,
        "metadata": {},
        "createdAt": "2025-10-13T12:26:26.785Z",
        "updatedAt": "2025-10-13T12:26:26.785Z",
        "issueDateFormatted": "15/1/2024",
        "expiryDateFormatted": null,
        "scoreDisplay": "98%"
      }
    ]
  }
}
```

#### 19. GET /api/partner/public/completed-courses/user/:userId

- **Mô tả**: Lấy danh sách khóa học hoàn thành của user (Public API, chỉ trả về courses do partner này phát hành)
- **Auth**: API Key (X-Partner-API-Key)
- **Query**: `?page=1&limit=50`
- **Response**: Giống như endpoint 18 nhưng chỉ courses của partner

#### 20. POST /api/partner/enrollment/:enrollmentId/complete

- **Mô tả**: Đánh dấu enrollment là hoàn thành và tạo CompletedCourse record
- **Auth**: JWT (Partner)
- **Body**:

```json
{
  "category": "Programming",
  "level": "Intermediate",
  "credits": 3,
  "grade": "A+",
  "score": 98,
  "skills": ["SQL", "Database Design"],
  "certificateUrl": "https://...",
  "verificationUrl": "https://...",
  "imageUrl": "https://...",
  "modulesCompleted": 10,
  "totalModules": 10
}
```

- **Response**: `{ success: true, data: { enrollment, completedCourse } }`

#### 21. PATCH /api/partner/completed-course/:courseId

- **Mô tả**: Cập nhật thông tin chi tiết của completed course
- **Auth**: JWT (Partner)
- **Body**: Các fields có thể cập nhật:

```json
{
  "description": "...",
  "category": "...",
  "level": "...",
  "credits": 3,
  "grade": "A+",
  "score": 95,
  "skills": ["..."],
  "certificateUrl": "...",
  "verificationUrl": "...",
  "imageUrl": "...",
  "modulesCompleted": 10,
  "totalModules": 10,
  "metadata": {}
}
```

### Ví dụ Workflow: Tự động tạo Completed Course

#### Flow 1: Tự động khi update progress

```bash
# Khi partner cập nhật status = "completed", system tự động tạo CompletedCourse
curl -X PATCH \
  -H "Authorization: Bearer PARTNER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "progressPercent": 100,
    "totalPoints": 98,
    "status": "completed",
    "category": "Programming",
    "level": "Intermediate",
    "credits": 3,
    "grade": "A+",
    "skills": ["SQL", "Database Design", "MySQL"],
    "certificateUrl": "https://example.com/cert.pdf"
  }' \
  "https://api-eduwallet.mojistudio.vn/api/partner/enrollment/ENROLLMENT_ID/progress"

# Response sẽ bao gồm cả completedCourse đã được tạo tự động
```

#### Flow 2: Tạo thủ công

```bash
# Partner chủ động tạo completed course từ enrollment
curl -X POST \
  -H "Authorization: Bearer PARTNER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Programming",
    "level": "Advanced",
    "credits": 4,
    "grade": "A",
    "score": 92,
    "skills": ["Node.js", "Express", "MongoDB"],
    "certificateUrl": "https://example.com/cert.pdf",
    "modulesCompleted": 12,
    "totalModules": 12
  }' \
  "https://api-eduwallet.mojistudio.vn/api/partner/enrollment/ENROLLMENT_ID/complete"
```

#### Flow 3: Lấy danh sách completed courses

```bash
# Partner lấy tất cả completed courses của một user
curl -H "Authorization: Bearer PARTNER_JWT_TOKEN" \
  "https://api-eduwallet.mojistudio.vn/api/partner/completed-courses/USER_ID?page=1&limit=50"

# Hoặc dùng API key (public)
curl -H "X-Partner-API-Key: YOUR_API_KEY" \
  "https://api-eduwallet.mojistudio.vn/api/partner/public/completed-courses/user/USER_ID"
```

---

Lưu ý bảo mật

- Không gửi apikey qua query string trong production (referer, logs).
- Lưu apiKey an toàn: hash hoặc HMAC trong DB. (Hiện project lưu plaintext; khuyến nghị chuyển sang hash.)
- Xác thực luôn timestamp + signature để tránh replay.
- Thêm rate-limiting cho webhooks và endpoint công khai.

Best practices cho partner implementers

- Gửi event khi:
  - Học viên hoàn thành 1 course (eventType: course_result)
  - Học viên cập nhật tiến trình (eventType: progress_update)
  - Chứng nhận được cấp (eventType: certificate_issued)
- Gửi studentId và courseId do partner quản lý; EduWallet dùng các trường này để liên kết hoặc tạo record mới.
- Nếu partner không muốn push, EduWallet có thể pull bằng cách gọi 1 endpoint partner-provided (cấu hình trong partner.apiEndpoints.courseAccess)

Troubleshooting

- Nếu EduWallet trả 401: kiểm tra X-Partner-Signature hoặc partner.apiSecretKey
- Nếu payload không hiển thị: kiểm tra body JSON chính xác (không có trailing commas), và timestamp chưa quá xa

Mẫu payload đầy đủ (ví dụ gửi nhiều course)
{
"partnerId": "partner_abc",
"eventType": "batch_course_results",
"timestamp": "2025-10-30T08:00:00Z",
"courses": [
/* use the courses object shown above */
]
}
