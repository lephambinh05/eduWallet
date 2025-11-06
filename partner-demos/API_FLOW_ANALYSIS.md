# API Flow Analysis - Partner & EduWallet Integration

## 📊 KIỂM TRA 2 FLOWS CHÍNH

### ✅ FLOW 1: GET KHÓA HỌC TỪ PARTNER → EDUWALLET

**Mục đích:** EduWallet đồng bộ danh sách khóa học từ Partner website

#### API Partner cung cấp:

```javascript
GET / api / courses;
```

**Location:** `partner-demos/website-1-video/routes/api.js` (line 182-217)

**Implementation:**

```javascript
router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      courses: courses.map((c) => ({
        id: c.courseId,
        courseId: c.courseId,
        title: c.title,
        name: c.title,
        description: c.description,
        issuer: c.issuer,
        category: c.category,
        level: c.level,
        credits: c.credits,
        courseType: c.courseType, // video | quiz | hybrid
        videoId: c.videoId,
        videoDuration: c.videoDuration,
        quiz: c.quiz, // Quiz questions
        skills: c.skills,
        link: c.link,
        priceEdu: c.priceEdu,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
});
```

**Data Source:** MongoDB (Partner's database)

**Response Format:**

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
    },
    {
      "courseId": "quiz_1699123456_xyz789",
      "title": "React Advanced Quiz",
      "courseType": "quiz",
      "quiz": {
        "questions": [...],
        "passingScore": 70,
        "timeLimit": 900
      },
      "priceEdu": 30,
      ...
    }
  ]
}
```

**Status:** ✅ **HOÀN THÀNH**

- Database-driven (MongoDB)
- Không có hardcoded data
- Hỗ trợ 3 loại course: video, quiz, hybrid
- Trả về đầy đủ thông tin cho EduWallet

---

### ❌ FLOW 2: POST TẠO KHÓA HỌC TỰ ĐỘNG KHI USER MUA

**Mục đích:** Khi user mua khóa học trên EduWallet, tự động tạo enrollment/access trên Partner website

#### ⚠️ **CHƯA CÓ API NÀY!**

**Hiện tại Partner website có:**

- ✅ POST `/api/courses` - Để **Partner** tự tạo khóa học (không phải từ EduWallet)
- ✅ POST `/api/learning/start` - User bắt đầu học (cần studentId + courseId)
- ❌ **THIẾU:** API để EduWallet thông báo user đã mua khóa học

---

## 🔍 PHÂN TÍCH VẤN ĐỀ

### Vấn đề 1: POST `/api/courses` không phù hợp

API này dùng để **Partner tạo khóa học mới**, không phải để:

- Tạo enrollment khi user mua
- Grant access cho user
- Liên kết userId với courseId

### Vấn đề 2: Flow hiện tại có gap

**Flow hiện tại:**

1. ✅ Partner tạo course → Lưu DB
2. ✅ EduWallet GET courses → Đồng bộ
3. ✅ User mua course trên EduWallet
4. ❓ **GAP:** EduWallet không thông báo cho Partner
5. ❌ User không có quyền truy cập course trên Partner website

**Flow lý tưởng:**

1. ✅ Partner tạo course → Lưu DB
2. ✅ EduWallet GET courses → Đồng bộ
3. ✅ User mua course trên EduWallet
4. 🆕 **EduWallet POST enrollment webhook → Partner**
5. ✅ Partner lưu enrollment → User có quyền học
6. ✅ User access course link → Đã có permission

---

## 🛠️ GIẢI PHÁP ĐỀ XUẤT

### Option 1: Webhook khi user mua khóa học (RECOMMENDED)

**EduWallet gọi API này khi user mua thành công:**

```javascript
POST /api/webhooks/enrollment-created
Content-Type: application/json
X-Partner-Id: partner_video_demo_001
X-Partner-Timestamp: 1699123456
X-Partner-Signature: sha256=abc123...

{
  "partnerId": "partner_video_demo_001",
  "eventType": "enrollment_created",
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

**Partner xử lý:**

```javascript
router.post("/webhooks/enrollment-created", async (req, res) => {
  try {
    // Verify signature
    const timestamp = req.headers["x-partner-timestamp"];
    const signature = req.headers["x-partner-signature"];
    const bodyString = JSON.stringify(req.body);

    if (!verifySignature(timestamp, bodyString, signature)) {
      return res.status(401).json({
        success: false,
        message: "Invalid signature",
      });
    }

    const { enrollmentId, userId, courseId, purchaseDate } = req.body;

    // Kiểm tra course có tồn tại không
    const course = await Course.findOne({ courseId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Lưu enrollment vào DB
    const enrollment = new Enrollment({
      enrollmentId,
      userId,
      courseId,
      status: "active",
      purchaseDate,
      accessGranted: true,
    });

    await enrollment.save();

    // Grant access cho user
    if (!userAccess[userId]) {
      userAccess[userId] = [];
    }
    userAccess[userId].push(courseId);

    res.json({
      success: true,
      message: "Enrollment created successfully",
      enrollment: {
        enrollmentId,
        userId,
        courseId,
        status: "active",
        accessUrl: `${process.env.PARTNER_URL}/course/${courseId}?student=${userId}`,
      },
    });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create enrollment",
      error: error.message,
    });
  }
});
```

### Option 2: Poll-based (không khuyến khích)

EduWallet định kỳ gửi danh sách enrollments mới, Partner check và cập nhật.

**Nhược điểm:**

- Delay cao
- Không real-time
- Tốn resources

---

## 📋 CHECKLIST CẦN LÀM

### Backend (Partner Website):

- [ ] Tạo Enrollment Schema trong MongoDB

  ```javascript
  const EnrollmentSchema = new mongoose.Schema({
    enrollmentId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "completed", "expired"],
      default: "active",
    },
    purchaseDate: Date,
    expiryDate: Date,
    accessGranted: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  });
  ```

- [ ] Implement webhook endpoint:

  - `POST /api/webhooks/enrollment-created`
  - Verify HMAC signature
  - Lưu enrollment vào DB
  - Grant access cho user

- [ ] Thêm middleware check access:

  ```javascript
  async function checkCourseAccess(req, res, next) {
    const { userId, courseId } = req.query;

    const enrollment = await Enrollment.findOne({
      userId,
      courseId,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Please purchase this course first.",
      });
    }

    next();
  }
  ```

- [ ] Update learning endpoints để check access:
  ```javascript
  router.post("/learning/start", checkCourseAccess, async (req, res) => {
    // existing code...
  });
  ```

### Backend (EduWallet):

- [ ] Implement webhook caller khi user purchase:

  ```javascript
  // After successful purchase
  const webhookData = {
    partnerId: course.partnerId,
    eventType: "enrollment_created",
    enrollmentId: enrollment._id,
    userId: user._id,
    courseId: course.courseId,
    purchaseDate: new Date().toISOString(),
  };

  await sendWebhookToPartner(
    partner.webhookUrl + "/api/webhooks/enrollment-created",
    webhookData,
    partner.secret
  );
  ```

### Database:

- [ ] Tạo Enrollment collection
- [ ] Index: userId, courseId, enrollmentId
- [ ] Migration script cho enrollments hiện tại

---

## 🎯 KẾT LUẬN

### FLOW 1: GET Courses ✅

- **Status:** HOÀN THÀNH
- **Location:** `GET /api/courses`
- **Data Source:** MongoDB
- **Response:** Full course info với 3 types (video/quiz/hybrid)

### FLOW 2: POST Create Enrollment ❌

- **Status:** CHƯA CÓ
- **Cần:** Webhook endpoint để nhận thông báo purchase từ EduWallet
- **Endpoint đề xuất:** `POST /api/webhooks/enrollment-created`
- **Purpose:** Grant access cho user sau khi mua khóa học

### Độ ưu tiên:

1. 🔴 **HIGH:** Implement enrollment webhook (Flow 2)
2. 🟡 **MEDIUM:** Add access control middleware
3. 🟢 **LOW:** Enrollment management UI

---

## 📝 NOTES

**Hiện tại thiếu:**

- Enrollment tracking system
- Access control mechanism
- User permission validation

**Workaround tạm thời:**

- User có thể access mọi course với bất kỳ studentId nào
- Không có validation mua khóa học
- Không track enrollments

**Security risk:**

- ⚠️ Bất kỳ ai cũng có thể học miễn phí nếu biết courseId và studentId
- ⚠️ Không có payment verification
