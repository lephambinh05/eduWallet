# 📚 Partner API Documentation

## 🔐 Authentication Methods

### 1. JWT Token Authentication
For endpoints requiring partner login:
```
Authorization: Bearer <JWT_TOKEN>
```

### 2. API Key Authentication  
For public endpoints:
```
X-API-Key: <PARTNER_API_KEY>
```
Or as query parameter:
```
?apiKey=<PARTNER_API_KEY>
```

---

## 📋 API Endpoints Overview

### 🔑 **API Key Management** (4 endpoints)
- `GET /api/partner/apikey/validate` - Validate API key
- `POST /api/partner/apikey/generate` - Generate/rotate API key
- `GET /api/partner/apikey` - Get API key metadata
- `POST /api/partner/apikey/reveal` - Reveal plaintext API key

### 📚 **Course Management** (6 endpoints)
- `POST /api/partner/courses` - Create course
- `GET /api/partner/courses` - Get partner's courses
- `PUT /api/partner/courses/:id` - Update course
- `GET /api/partner/public/course/:id` - Get course by ID (public)
- `GET /api/partner/public-courses` - Public course listing
- `PATCH /api/partner/courses/:id/publish` - Publish/unpublish course

### 🛒 **Enrollment & Purchase** (6 endpoints)
- `POST /api/partner/courses/:id/purchase` - Purchase course
- `GET /api/partner/my-enrollments` - Get user's enrollments
- `GET /api/partner/enrollment/:enrollmentId` - Get enrollment details
- `PATCH /api/partner/enrollment/:enrollmentId/progress` - Update progress
- `GET /api/partner/public/enrollment/student/:studentId` - Get student enrollment
- `GET /api/partner/courses/:courseId/students` - Get course students

### 💰 **Sales & Analytics** (2 endpoints)
- `GET /api/partner/sales` - Get partner's sales
- `GET /api/partner/learners` - Get partner's learners

### 🎓 **Completed Courses** (4 endpoints)
- `GET /api/partner/completed-courses/:userId` - Get user's completed courses
- `GET /api/partner/public/completed-courses/user/:userId` - Public completed courses
- `POST /api/partner/enrollment/:enrollmentId/complete` - Mark enrollment complete
- `PATCH /api/partner/completed-course/:courseId` - Update completed course

---

## 🔑 API Key Management

### 1. Validate API Key

**Endpoint:** `GET /api/partner/apikey/validate`

**Authentication:** API Key (query/header)

**Description:** Validate an API key and return partner basic information.

**Request:**
```http
GET /api/partner/apikey/validate
X-API-Key: your-api-key-here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "partner": {
      "_id": "partner123",
      "name": "Video Learning Platform",
      "domain": "videolearn.com",
      "supportedFeatures": ["video", "quiz"]
    }
  }
}
```

---

### 2. Generate/Rotate API Key

**Endpoint:** `POST /api/partner/apikey/generate`

**Authentication:** JWT Token (partner role)

**Description:** Generate a new API key or rotate existing key (requires password for rotation).

**Request (First time):**
```http
POST /api/partner/apikey/generate
Authorization: Bearer <JWT_TOKEN>
```

**Request (Rotation):**
```http
POST /api/partner/apikey/generate
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "password": "your-account-password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "apiKey": "a1b2c3d4e5f6...new-key",
    "createdAt": "2025-10-30T10:00:00.000Z",
    "rotatedAt": "2025-10-30T10:00:00.000Z"
  }
}
```

**⚠️ Important:** Save the API key immediately. It won't be shown again unless you use the reveal endpoint.

---

### 3. Get API Key Metadata

**Endpoint:** `GET /api/partner/apikey`

**Authentication:** JWT Token (partner role)

**Description:** Get API key metadata without revealing the plaintext key.

**Request:**
```http
GET /api/partner/apikey
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exists": true,
    "maskedKey": "a1b2c***d4e5f",
    "createdAt": "2025-10-30T10:00:00.000Z",
    "rotatedAt": "2025-10-30T11:00:00.000Z"
  }
}
```

---

### 4. Reveal API Key

**Endpoint:** `POST /api/partner/apikey/reveal`

**Authentication:** JWT Token (partner role)

**Description:** Reveal the plaintext API key (for logged-in partner user).

**Request:**
```http
POST /api/partner/apikey/reveal
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "apiKey": "a1b2c3d4e5f6...full-key",
    "createdAt": "2025-10-30T10:00:00.000Z",
    "rotatedAt": "2025-10-30T11:00:00.000Z"
  }
}
```

---

## 📚 Course Management

### 1. Create Course

**Endpoint:** `POST /api/partner/courses`

**Authentication:** JWT Token (partner role)

**Description:** Create a new partner course.

**Request:**
```http
POST /api/partner/courses
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Advanced JavaScript Course",
  "description": "Learn modern JavaScript from basics to advanced",
  "link": "https://yourplatform.com/courses/js-advanced",
  "priceEdu": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course created",
  "data": {
    "course": {
      "_id": "course123",
      "owner": "partner123",
      "title": "Advanced JavaScript Course",
      "description": "Learn modern JavaScript from basics to advanced",
      "link": "https://yourplatform.com/courses/js-advanced",
      "priceEdu": 100,
      "isPublished": false,
      "createdAt": "2025-10-30T10:00:00.000Z"
    }
  }
}
```

---

### 2. Get Partner's Courses

**Endpoint:** `GET /api/partner/courses`

**Authentication:** JWT Token (partner role)

**Description:** Get all courses owned by authenticated partner.

**Request:**
```http
GET /api/partner/courses
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "_id": "course123",
        "title": "Advanced JavaScript Course",
        "priceEdu": 100,
        "isPublished": true,
        "createdAt": "2025-10-30T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 3. Update Course

**Endpoint:** `PUT /api/partner/courses/:id`

**Authentication:** JWT Token (partner role)

**Description:** Update course details (only course owner can update).

**Request:**
```http
PUT /api/partner/courses/course123
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Advanced JavaScript & TypeScript Course",
  "description": "Updated description",
  "priceEdu": 120
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course updated",
  "data": {
    "course": {
      "_id": "course123",
      "title": "Advanced JavaScript & TypeScript Course",
      "description": "Updated description",
      "priceEdu": 120
    }
  }
}
```

---

### 4. Get Course by ID (Public)

**Endpoint:** `GET /api/partner/public/course/:id`

**Authentication:** API Key (query/header)

**Description:** Get course details using API key authentication.

**Request:**
```http
GET /api/partner/public/course/course123
X-API-Key: your-api-key
```

**Response:**
```json
{
  "success": true,
  "data": {
    "partner": {
      "_id": "partner123",
      "name": "Video Learning Platform"
    },
    "course": {
      "_id": "course123",
      "title": "Advanced JavaScript Course",
      "description": "Learn modern JavaScript",
      "link": "https://yourplatform.com/courses/js-advanced",
      "priceEdu": 100,
      "owner": {
        "_id": "partner123",
        "username": "videolearn",
        "email": "contact@videolearn.com"
      }
    }
  }
}
```

---

### 5. Public Course Listing

**Endpoint:** `GET /api/partner/public-courses`

**Authentication:** None

**Description:** Public listing of partner courses with search and pagination.

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 24) - Items per page
- `q` - Search query (text search)

**Request:**
```http
GET /api/partner/public-courses?page=1&limit=24&q=javascript
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "courses": [
      {
        "_id": "course123",
        "title": "Advanced JavaScript Course",
        "description": "Learn modern JavaScript",
        "priceEdu": 100,
        "owner": {
          "username": "videolearn",
          "firstName": "Video",
          "lastName": "Learning"
        },
        "createdAt": "2025-10-30T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 6. Publish/Unpublish Course

**Endpoint:** `PATCH /api/partner/courses/:id/publish`

**Authentication:** JWT Token (partner role)

**Description:** Publish or unpublish a course.

**Request (Publish):**
```http
PATCH /api/partner/courses/course123/publish
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "publish": true
}
```

**Request (Unpublish):**
```json
{
  "publish": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course published",
  "data": {
    "course": {
      "_id": "course123",
      "title": "Advanced JavaScript Course",
      "isPublished": true
    }
  }
}
```

---

## 🛒 Enrollment & Purchase

### 1. Purchase Course

**Endpoint:** `POST /api/partner/courses/:id/purchase`

**Authentication:** JWT Token (any authenticated user)

**Description:** Purchase a course and create enrollment.

**Request:**
```http
POST /api/partner/courses/course123/purchase
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "metadata": {
    "source": "mobile_app"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course purchased",
  "data": {
    "purchase": {
      "_id": "purchase123",
      "itemId": "course123",
      "buyer": "user123",
      "seller": "partner123",
      "price": 100,
      "quantity": 1,
      "total": 100,
      "createdAt": "2025-10-30T10:00:00.000Z"
    },
    "enrollment": {
      "_id": "enrollment123",
      "user": "user123",
      "itemId": "course123",
      "purchase": "purchase123",
      "courseTitle": "Advanced JavaScript Course",
      "accessLink": "https://yourplatform.com/courses/js-advanced?student=user123",
      "progressPercent": 0,
      "totalPoints": 0,
      "timeSpentSeconds": 0,
      "status": "in_progress"
    }
  }
}
```

**📧 Email Notifications:** 
- Buyer receives purchase confirmation email
- Seller receives new sale notification email

---

### 2. Get User's Enrollments

**Endpoint:** `GET /api/partner/my-enrollments`

**Authentication:** JWT Token (any authenticated user)

**Description:** Get all courses enrolled by the authenticated user.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)

**Request:**
```http
GET /api/partner/my-enrollments?page=1&limit=50
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "enrollments": [
      {
        "_id": "enrollment123",
        "user": {
          "username": "john_doe",
          "email": "john@example.com"
        },
        "itemId": {
          "title": "Advanced JavaScript Course",
          "link": "https://yourplatform.com/courses/js-advanced"
        },
        "seller": {
          "username": "videolearn"
        },
        "progressPercent": 45,
        "status": "in_progress",
        "createdAt": "2025-10-30T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 3. Get Enrollment Details

**Endpoint:** `GET /api/partner/enrollment/:enrollmentId`

**Authentication:** JWT Token (partner role)

**Description:** Get detailed enrollment information (only for partner's own courses).

**Request:**
```http
GET /api/partner/enrollment/enrollment123
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollment": {
      "_id": "enrollment123",
      "user": {
        "username": "john_doe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "itemId": {
        "title": "Advanced JavaScript Course",
        "link": "https://yourplatform.com/courses/js-advanced",
        "priceEdu": 100
      },
      "seller": {
        "username": "videolearn"
      },
      "purchase": {
        "total": 100,
        "createdAt": "2025-10-30T10:00:00.000Z"
      },
      "progressPercent": 45,
      "totalPoints": 850,
      "timeSpentSeconds": 3600,
      "status": "in_progress",
      "metadata": {},
      "lastAccessed": "2025-10-30T11:00:00.000Z"
    }
  }
}
```

---

### 4. Update Enrollment Progress

**Endpoint:** `PATCH /api/partner/enrollment/:enrollmentId/progress`

**Authentication:** JWT Token (partner role)

**Description:** Update student progress (only for partner's own courses). Auto-creates CompletedCourse when status becomes "completed".

**Request:**
```http
PATCH /api/partner/enrollment/enrollment123/progress
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

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

**Request (Mark as Completed):**
```json
{
  "status": "completed",
  "totalPoints": 1500,
  "category": "Programming",
  "level": "Advanced",
  "credits": 3,
  "grade": "A",
  "skills": ["JavaScript", "TypeScript", "React"],
  "certificateUrl": "https://yourplatform.com/certificates/cert123",
  "verificationUrl": "https://yourplatform.com/verify/cert123",
  "modulesCompleted": 10,
  "totalModules": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Progress updated",
  "data": {
    "enrollment": {
      "_id": "enrollment123",
      "progressPercent": 100,
      "totalPoints": 1500,
      "status": "completed",
      "completedAt": "2025-10-30T12:00:00.000Z"
    },
    "completedCourse": {
      "_id": "completed123",
      "userId": "user123",
      "enrollmentId": "enrollment123",
      "name": "Advanced JavaScript Course",
      "issuer": "Video Learning Platform",
      "category": "Programming",
      "level": "Advanced",
      "credits": 3,
      "grade": "A",
      "score": 1500,
      "status": "completed",
      "skills": ["JavaScript", "TypeScript", "React"],
      "certificateUrl": "https://yourplatform.com/certificates/cert123"
    }
  }
}
```

**Fields:**
- `progressPercent` - Progress percentage (0-100)
- `totalPoints` - Total points earned
- `timeSpentSeconds` - Time spent in seconds
- `status` - "in_progress" | "completed" | "dropped"
- `metadata` - Custom metadata object
- `category` - Course category (for CompletedCourse)
- `level` - Course level (for CompletedCourse)
- `credits` - Academic credits (for CompletedCourse)
- `grade` - Letter grade (for CompletedCourse)
- `skills` - Array of skills learned
- `certificateUrl` - URL to certificate
- `verificationUrl` - URL to verify certificate
- `modulesCompleted` - Number of modules completed
- `totalModules` - Total number of modules

---

### 5. Get Student Enrollment (Public)

**Endpoint:** `GET /api/partner/public/enrollment/student/:studentId`

**Authentication:** API Key (query/header)

**Description:** Get enrollment(s) for a specific student using API key.

**Query Parameters:**
- `courseId` (optional) - Filter by course ID

**Request:**
```http
GET /api/partner/public/enrollment/student/user123?courseId=course123
X-API-Key: your-api-key
```

**Response:**
```json
{
  "success": true,
  "data": {
    "partner": {
      "_id": "partner123",
      "name": "Video Learning Platform"
    },
    "enrollments": [
      {
        "_id": "enrollment123",
        "user": {
          "username": "john_doe",
          "email": "john@example.com"
        },
        "itemId": {
          "title": "Advanced JavaScript Course",
          "link": "https://yourplatform.com/courses/js-advanced"
        },
        "purchase": {
          "total": 100,
          "createdAt": "2025-10-30T10:00:00.000Z"
        },
        "progressPercent": 45,
        "status": "in_progress"
      }
    ]
  }
}
```

---

### 6. Get Course Students

**Endpoint:** `GET /api/partner/courses/:courseId/students`

**Authentication:** JWT Token (partner role)

**Description:** Get all students enrolled in a specific course (only for course owner).

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)

**Request:**
```http
GET /api/partner/courses/course123/students?page=1&limit=50
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "course": {
      "_id": "course123",
      "title": "Advanced JavaScript Course"
    },
    "total": 25,
    "students": [
      {
        "_id": "enrollment123",
        "user": {
          "username": "john_doe",
          "email": "john@example.com",
          "firstName": "John",
          "lastName": "Doe"
        },
        "purchase": {
          "total": 100,
          "createdAt": "2025-10-30T10:00:00.000Z"
        },
        "progressPercent": 45,
        "totalPoints": 850,
        "status": "in_progress",
        "createdAt": "2025-10-30T10:00:00.000Z"
      }
    ]
  }
}
```

---

## 💰 Sales & Analytics

### 1. Get Partner's Sales

**Endpoint:** `GET /api/partner/sales`

**Authentication:** JWT Token (partner role)

**Description:** Get all sales/purchases for authenticated partner's courses.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 100)

**Request:**
```http
GET /api/partner/sales?page=1&limit=100
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 156,
    "sales": [
      {
        "_id": "purchase123",
        "itemId": {
          "name": "Advanced JavaScript Course"
        },
        "buyer": {
          "username": "john_doe",
          "email": "john@example.com"
        },
        "price": 100,
        "quantity": 1,
        "total": 100,
        "createdAt": "2025-10-30T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 2. Get Partner's Learners

**Endpoint:** `GET /api/partner/learners`

**Authentication:** JWT Token (partner role)

**Description:** Get all learners/enrollments for authenticated partner's courses.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)

**Request:**
```http
GET /api/partner/learners?page=1&limit=50
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 98,
    "learners": [
      {
        "_id": "enrollment123",
        "user": {
          "username": "john_doe",
          "email": "john@example.com",
          "firstName": "John",
          "lastName": "Doe"
        },
        "itemId": {
          "name": "Advanced JavaScript Course"
        },
        "progressPercent": 45,
        "status": "in_progress",
        "createdAt": "2025-10-30T10:00:00.000Z"
      }
    ]
  }
}
```

---

## 🎓 Completed Courses

### 1. Get User's Completed Courses

**Endpoint:** `GET /api/partner/completed-courses/:userId`

**Authentication:** JWT Token (partner role)

**Description:** Get all completed courses for a specific user.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)

**Request:**
```http
GET /api/partner/completed-courses/user123?page=1&limit=50
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 12,
    "page": 1,
    "limit": 50,
    "courses": [
      {
        "_id": "completed123",
        "userId": {
          "username": "john_doe",
          "email": "john@example.com"
        },
        "issuerId": {
          "name": "Video Learning Platform",
          "username": "videolearn"
        },
        "enrollmentId": "enrollment123",
        "name": "Advanced JavaScript Course",
        "description": "Learn modern JavaScript",
        "issuer": "Video Learning Platform",
        "issueDate": "2025-10-30T12:00:00.000Z",
        "category": "Programming",
        "level": "Advanced",
        "credits": 3,
        "grade": "A",
        "score": 1500,
        "status": "completed",
        "progress": 100,
        "skills": ["JavaScript", "TypeScript", "React"],
        "certificateUrl": "https://yourplatform.com/certificates/cert123",
        "verificationUrl": "https://yourplatform.com/verify/cert123",
        "modulesCompleted": 10,
        "totalModules": 10,
        "createdAt": "2025-10-30T12:00:00.000Z"
      }
    ]
  }
}
```

---

### 2. Get User's Completed Courses (Public)

**Endpoint:** `GET /api/partner/public/completed-courses/user/:userId`

**Authentication:** API Key (query/header)

**Description:** Public API to get user's completed courses issued by the authenticated partner.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)

**Request:**
```http
GET /api/partner/public/completed-courses/user/user123?page=1&limit=50
X-API-Key: your-api-key
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "page": 1,
    "limit": 50,
    "courses": [
      {
        "_id": "completed123",
        "userId": "user123",
        "issuerId": "partner123",
        "enrollmentId": "enrollment123",
        "name": "Advanced JavaScript Course",
        "issuer": "Video Learning Platform",
        "category": "Programming",
        "level": "Advanced",
        "credits": 3,
        "grade": "A",
        "score": 1500,
        "status": "completed",
        "skills": ["JavaScript", "TypeScript", "React"]
      }
    ]
  }
}
```

---

### 3. Mark Enrollment as Completed

**Endpoint:** `POST /api/partner/enrollment/:enrollmentId/complete`

**Authentication:** JWT Token (partner role)

**Description:** Mark enrollment as completed and create CompletedCourse record.

**Request:**
```http
POST /api/partner/enrollment/enrollment123/complete
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "category": "Programming",
  "level": "Advanced",
  "credits": 3,
  "grade": "A",
  "score": 1500,
  "skills": ["JavaScript", "TypeScript", "React"],
  "certificateUrl": "https://yourplatform.com/certificates/cert123",
  "verificationUrl": "https://yourplatform.com/verify/cert123",
  "imageUrl": "https://yourplatform.com/images/js-course.jpg",
  "modulesCompleted": 10,
  "totalModules": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Enrollment marked as completed",
  "data": {
    "enrollment": {
      "_id": "enrollment123",
      "status": "completed",
      "progressPercent": 100,
      "completedAt": "2025-10-30T12:00:00.000Z",
      "totalPoints": 1500
    },
    "completedCourse": {
      "_id": "completed123",
      "userId": "user123",
      "enrollmentId": "enrollment123",
      "name": "Advanced JavaScript Course",
      "issuer": "Video Learning Platform",
      "category": "Programming",
      "level": "Advanced",
      "credits": 3,
      "grade": "A",
      "score": 1500,
      "skills": ["JavaScript", "TypeScript", "React"],
      "certificateUrl": "https://yourplatform.com/certificates/cert123"
    }
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "This enrollment has already been marked as completed",
  "data": {
    "course": { ... }
  }
}
```

---

### 4. Update Completed Course

**Endpoint:** `PATCH /api/partner/completed-course/:courseId`

**Authentication:** JWT Token (partner role)

**Description:** Update completed course details (only for partner's own issued courses).

**Request:**
```http
PATCH /api/partner/completed-course/completed123
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "description": "Updated description",
  "grade": "A+",
  "score": 1600,
  "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
  "certificateUrl": "https://yourplatform.com/certificates/cert123-v2"
}
```

**Allowed Update Fields:**
- `description`
- `category`
- `level`
- `credits`
- `grade`
- `score`
- `skills`
- `certificateUrl`
- `verificationUrl`
- `imageUrl`
- `modulesCompleted`
- `totalModules`
- `metadata`

**Response:**
```json
{
  "success": true,
  "message": "Completed course updated",
  "data": {
    "course": {
      "_id": "completed123",
      "description": "Updated description",
      "grade": "A+",
      "score": 1600,
      "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
      "certificateUrl": "https://yourplatform.com/certificates/cert123-v2"
    }
  }
}
```

**Note:** If `score` is updated without `grade`, the grade will be auto-calculated based on the score.

---

## 🔒 Error Responses

All endpoints follow a consistent error response format:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: title, link, priceEdu"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid password"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to update this course"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Course not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details..."
}
```

---

## 📊 Data Models

### PartnerCourse
```javascript
{
  _id: ObjectId,
  owner: ObjectId (ref: User),
  title: String,
  description: String,
  link: String,
  priceEdu: Number,
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Purchase
```javascript
{
  _id: ObjectId,
  itemId: ObjectId (ref: PartnerCourse),
  buyer: ObjectId (ref: User),
  seller: ObjectId (ref: User),
  price: Number,
  quantity: Number,
  total: Number,
  metadata: Object,
  createdAt: Date
}
```

### Enrollment
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  itemId: ObjectId (ref: PartnerCourse),
  purchase: ObjectId (ref: Purchase),
  seller: ObjectId (ref: User),
  courseTitle: String,
  accessLink: String,
  progressPercent: Number,
  totalPoints: Number,
  timeSpentSeconds: Number,
  status: String, // "in_progress" | "completed" | "dropped"
  metadata: Object,
  completedAt: Date,
  lastAccessed: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### CompletedCourse
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  enrollmentId: ObjectId (ref: Enrollment),
  issuerId: ObjectId (ref: Partner),
  name: String,
  description: String,
  issuer: String,
  issueDate: Date,
  category: String,
  level: String,
  credits: Number,
  grade: String,
  score: Number,
  status: String,
  progress: Number,
  skills: [String],
  certificateUrl: String,
  verificationUrl: String,
  imageUrl: String,
  modulesCompleted: Number,
  totalModules: Number,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Quick Start Examples

### Example 1: Partner Registration & API Key Setup

```javascript
// 1. Register as partner
POST /api/auth/register
{
  "username": "videolearn",
  "email": "contact@videolearn.com",
  "password": "secure-password",
  "role": "partner"
}

// 2. Login
POST /api/auth/login
{
  "email": "contact@videolearn.com",
  "password": "secure-password"
}
// Response: { token: "jwt-token-here" }

// 3. Generate API Key
POST /api/partner/apikey/generate
Authorization: Bearer jwt-token-here
// Response: { apiKey: "your-api-key" }
```

---

### Example 2: Create & Publish Course

```javascript
// 1. Create course
POST /api/partner/courses
Authorization: Bearer jwt-token
{
  "title": "JavaScript Masterclass",
  "description": "Complete JavaScript course",
  "link": "https://yourplatform.com/js-masterclass",
  "priceEdu": 150
}

// 2. Publish course
PATCH /api/partner/courses/course123/publish
Authorization: Bearer jwt-token
{
  "publish": true
}
```

---

### Example 3: Student Purchase & Track Progress

```javascript
// 1. Student purchases course
POST /api/partner/courses/course123/purchase
Authorization: Bearer student-jwt-token

// 2. Partner tracks student progress
PATCH /api/partner/enrollment/enrollment123/progress
Authorization: Bearer partner-jwt-token
{
  "progressPercent": 50,
  "totalPoints": 750,
  "timeSpentSeconds": 3600
}

// 3. Mark as completed
POST /api/partner/enrollment/enrollment123/complete
Authorization: Bearer partner-jwt-token
{
  "category": "Programming",
  "level": "Advanced",
  "credits": 3,
  "grade": "A",
  "skills": ["JavaScript", "React"]
}
```

---

### Example 4: Using API Key for Public Access

```javascript
// 1. Validate API key
GET /api/partner/apikey/validate
X-API-Key: your-api-key

// 2. Get course details
GET /api/partner/public/course/course123
X-API-Key: your-api-key

// 3. Check student enrollment
GET /api/partner/public/enrollment/student/user123?courseId=course123
X-API-Key: your-api-key

// 4. Get student's completed courses
GET /api/partner/public/completed-courses/user/user123
X-API-Key: your-api-key
```

---

## 📝 Best Practices

### 1. Security
- ✅ Always use HTTPS in production
- ✅ Store API keys securely (environment variables)
- ✅ Rotate API keys periodically
- ✅ Use strong passwords for key rotation
- ✅ Validate all input data

### 2. Error Handling
- ✅ Handle all error responses properly
- ✅ Log errors for debugging
- ✅ Don't expose sensitive data in errors

### 3. Performance
- ✅ Use pagination for large datasets
- ✅ Cache frequently accessed data
- ✅ Limit query results with `limit` parameter

### 4. Data Integrity
- ✅ Verify ownership before updates
- ✅ Validate status transitions
- ✅ Use transactions for critical operations

---

## 🆘 Support

For technical support or questions:
- 📧 Email: support@eduwallet.com
- 📚 Documentation: https://docs.eduwallet.com
- 💬 Discord: https://discord.gg/eduwallet

---

**Last Updated:** October 30, 2025  
**API Version:** 1.0.0
