# EduWallet Partner API Integration Guide

## Tổng quan

EduWallet cung cấp hệ thống tích hợp với các đối tác giáo dục để mở rộng thư viện khóa học và cung cấp trải nghiệm học tập tốt nhất cho người dùng. Tài liệu này mô tả cách tích hợp API giữa EduWallet và website của đối tác.

## Luồng hoạt động tổng quát

```
1. Partner đăng ký khóa học trên EduWallet
2. Người dùng xem và mua khóa học trên EduWallet  
3. EduWallet gọi API của Partner để tạo access link
4. Người dùng truy cập khóa học trên website Partner
5. Partner gửi kết quả học tập về EduWallet qua API
6. EduWallet cập nhật điểm số và cấp chứng chỉ NFT
```

## API Requirements cho Partner

### 1. **Course Access API** (Bắt buộc)
Partner cần cung cấp endpoint để tạo link truy cập khóa học cho học viên đã thanh toán.

#### Endpoint: `POST /api/course-access`

**Request từ EduWallet:**
```json
{
  "courseId": "partner_course_123",
  "studentId": "eduwallet_user_456", 
  "studentEmail": "student@example.com",
  "studentName": "Nguyen Van A",
  "purchaseId": "purchase_789",
  "validUntil": "2025-12-31T23:59:59Z"
}
```

**Response từ Partner:**
```json
{
  "success": true,
  "data": {
    "accessLink": "https://partner.com/course/123?token=xyz&student=456",
    "validUntil": "2025-12-31T23:59:59Z",
    "instructions": "Nhấp vào link để bắt đầu học"
  }
}
```

### 2. **Learning Progress API** (Bắt buộc)
Partner cần cung cấp endpoint để EduWallet lấy kết quả học tập.

#### Endpoint: `GET /api/learning-progress/:studentId/:courseId`

**Response từ Partner:**
```json
{
  "success": true,
  "data": {
    "studentId": "eduwallet_user_456",
    "courseId": "partner_course_123",
    "progress": {
      "completionPercentage": 85.5,
      "totalTimeSpent": 7200, // seconds
      "lastAccessed": "2025-10-29T10:30:00Z",
      "startDate": "2025-10-01T09:00:00Z"
    },
    "scores": {
      "totalPoints": 850,
      "maxPoints": 1000,
      "averageScore": 85.5,
      "assessments": [
        {
          "type": "quiz",
          "name": "Quiz Chapter 1", 
          "score": 80,
          "maxScore": 100,
          "completedAt": "2025-10-15T14:30:00Z"
        },
        {
          "type": "assignment",
          "name": "Final Project",
          "score": 90,
          "maxScore": 100, 
          "completedAt": "2025-10-25T16:45:00Z"
        }
      ]
    },
    "certificate": {
      "issued": true,
      "issuedAt": "2025-10-26T10:00:00Z",
      "certificateUrl": "https://partner.com/certificates/cert_123.pdf",
      "grade": "A",
      "creditsEarned": 3
    }
  }
}
```

### 3. **Webhook Notifications** (Khuyến nghị)
Partner có thể gửi thông báo real-time khi có cập nhật.

#### Endpoint EduWallet: `POST https://api.eduwallet.com/webhooks/partner-updates`

**Request từ Partner:**
```json
{
  "eventType": "progress_updated", // hoặc "course_completed", "certificate_issued"
  "studentId": "eduwallet_user_456",
  "courseId": "partner_course_123", 
  "timestamp": "2025-10-29T10:30:00Z",
  "data": {
    // Dữ liệu tương tự Learning Progress API
  }
}
```

## Authentication & Security

### API Key Authentication
Mỗi partner sẽ được cấp API key để xác thực:

```http
Authorization: Bearer YOUR_PARTNER_API_KEY
Content-Type: application/json
```

### Webhook Security
EduWallet sẽ ký các webhook request:

```http
X-EduWallet-Signature: sha256=abc123...
X-EduWallet-Timestamp: 1698581400
```

## Cấu hình Partner trên EduWallet

### Partner Registration
```json
{
  "partnerName": "ABC Education",
  "partnerDomain": "https://abc-edu.com",
  "apiEndpoints": {
    "courseAccess": "https://abc-edu.com/api/course-access",
    "learningProgress": "https://abc-edu.com/api/learning-progress"
  },
  "webhookUrl": "https://abc-edu.com/webhooks/eduwallet",
  "apiKey": "partner_api_key_here",
  "supportedFeatures": [
    "course_access",
    "progress_tracking", 
    "certificates",
    "webhooks"
  ]
}
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "STUDENT_NOT_FOUND",
    "message": "Student not found in course",
    "details": "Student ID eduwallet_user_456 is not enrolled in course partner_course_123"
  }
}
```

### Common Error Codes
- `COURSE_NOT_FOUND`: Khóa học không tồn tại
- `STUDENT_NOT_FOUND`: Học viên không tìm thấy
- `ACCESS_EXPIRED`: Quyền truy cập đã hết hạn
- `INVALID_TOKEN`: Token không hợp lệ
- `RATE_LIMIT_EXCEEDED`: Vượt quá giới hạn request

## Testing & Validation

### Sandbox Environment
Partner có thể test trên môi trường sandbox:
- Base URL: `https://sandbox-api.eduwallet.com`
- Test student IDs: `test_student_001`, `test_student_002`
- Test course IDs: `test_course_001`, `test_course_002`

### API Testing Checklist
- [ ] Course access link generation
- [ ] Progress data retrieval
- [ ] Certificate issuance
- [ ] Error handling for invalid requests
- [ ] Webhook delivery (if implemented)

## Monitoring & Analytics

### Required Metrics
Partner nên theo dõi:
- API response times
- Error rates
- Student engagement metrics
- Course completion rates

### EduWallet sẽ cung cấp:
- API usage statistics
- Student learning analytics
- Revenue sharing reports

## Bổ sung API cho hoàn thiện

### 4. **Course Catalog API** (Khuyến nghị)
Để đồng bộ thông tin khóa học:

#### Endpoint: `GET /api/courses`
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "courseId": "partner_course_123",
        "title": "Advanced JavaScript",
        "description": "Learn modern JavaScript...",
        "category": "Programming",
        "level": "Intermediate",
        "duration": 40, // hours
        "price": 100, // EDU tokens
        "language": "vietnamese",
        "prerequisites": ["Basic JavaScript"],
        "learningOutcomes": [
          "Master ES6+ features",
          "Build modern web apps"
        ],
        "instructor": {
          "name": "John Doe",
          "bio": "Senior Developer...",
          "avatar": "https://partner.com/avatars/john.jpg"
        },
        "curriculum": [
          {
            "module": "ES6 Fundamentals", 
            "lessons": 8,
            "duration": 10
          }
        ],
        "isActive": true,
        "lastUpdated": "2025-10-29T10:00:00Z"
      }
    ]
  }
}
```

### 5. **Student Enrollment API** (Khuyến nghị)
Thông báo khi có học viên mới:

#### Endpoint: `POST /api/enroll-student`
```json
{
  "courseId": "partner_course_123",
  "student": {
    "id": "eduwallet_user_456",
    "email": "student@example.com", 
    "name": "Nguyen Van A",
    "preferredLanguage": "vi"
  },
  "enrollment": {
    "purchaseId": "purchase_789",
    "enrolledAt": "2025-10-29T10:00:00Z",
    "validUntil": "2025-12-31T23:59:59Z"
  }
}
```

### 6. **Certificate Verification API** (Khuyến nghị)
Xác thực chứng chỉ:

#### Endpoint: `GET /api/verify-certificate/:certificateId`
```json
{
  "success": true,
  "data": {
    "valid": true,
    "certificateId": "cert_123",
    "studentName": "Nguyen Van A",
    "courseName": "Advanced JavaScript",
    "issuedAt": "2025-10-26T10:00:00Z",
    "grade": "A",
    "verificationUrl": "https://partner.com/verify/cert_123"
  }
}
```

## Implementation Timeline

### Phase 1 (Tuần 1-2)
- [ ] Implement Course Access API
- [ ] Basic authentication
- [ ] Error handling

### Phase 2 (Tuần 3-4)  
- [ ] Learning Progress API
- [ ] Certificate integration
- [ ] Testing & validation

### Phase 3 (Tuần 5-6)
- [ ] Webhook notifications
- [ ] Advanced analytics
- [ ] Performance optimization

## Support & Documentation

### Technical Support
- Email: partner-support@eduwallet.com
- Slack: #partner-integration
- Office hours: 9AM-6PM (GMT+7)

### Resources
- API Reference: https://docs.eduwallet.com/partner-api
- SDKs: https://github.com/eduwallet/partner-sdks
- Status Page: https://status.eduwallet.com

## Best Practices

1. **Security First**: Luôn validate input và sử dụng HTTPS
2. **Rate Limiting**: Implement rate limiting để tránh abuse
3. **Caching**: Cache dữ liệu ít thay đổi để tăng performance
4. **Monitoring**: Setup logging và monitoring cho tất cả API calls
5. **Graceful Degradation**: Xử lý lỗi một cách uyển chuyển
6. **Data Privacy**: Tuân thủ GDPR và các quy định bảo mật dữ liệu

---

**Lưu ý**: Tài liệu này sẽ được cập nhật định kỳ. Vui lòng theo dõi phiên bản mới nhất tại https://docs.eduwallet.com/partner-integration