# Admin Backend API Documentation

## 📋 Tổng quan

Hệ thống Admin Backend cung cấp đầy đủ chức năng CRUD để quản lý users, với các tính năng bảo mật và logging chi tiết.

## 🔐 Authentication

Tất cả admin endpoints yêu cầu:
- JWT token hợp lệ trong header `Authorization: Bearer <token>`
- User role phải là `admin` hoặc `super_admin`

## 📍 API Endpoints

### Dashboard

#### GET /api/admin/dashboard
Lấy thống kê tổng quan hệ thống.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "overview": {
        "totalUsers": 150,
        "activeUsers": 120,
        "inactiveUsers": 30,
        "newUsersThisMonth": 25,
        "newUsersThisWeek": 8,
        "emailVerifiedCount": 100
      },
      "usersByRole": {
        "students": 130,
        "admins": 5,
        "institutions": 15
      },
      "recentUsers": [...]
    }
  }
}
```

---

### User Management

#### GET /api/admin/users
Lấy danh sách tất cả users với phân trang, tìm kiếm và filter.

**Query Parameters:**
- `page` (number, default: 1) - Số trang
- `limit` (number, default: 20, max: 100) - Số users mỗi trang
- `role` (string) - Filter theo role: `student`, `institution`, `admin`, `super_admin`
- `status` (string) - Filter theo status: `active`, `inactive`, `blocked`
- `search` (string) - Tìm kiếm theo username, email, firstName, lastName
- `sortBy` (string, default: 'createdAt') - Sắp xếp theo field
- `order` (string, default: 'desc') - Thứ tự: `asc`, `desc`
- `isEmailVerified` (boolean) - Filter theo email verification

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "current": 1,
      "pages": 10,
      "total": 200,
      "limit": 20
    }
  }
}
```

---

#### GET /api/admin/users/:id
Lấy chi tiết một user.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student",
      "isActive": true,
      ...
    }
  }
}
```

---

#### POST /api/admin/users
Tạo user mới.

**Request Body:**
```json
{
  "username": "new_user",
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "New",
  "lastName": "User",
  "dateOfBirth": "2000-01-01",
  "phone": "+1234567890",
  "role": "student",
  "isActive": true,
  "isEmailVerified": false
}
```

**Validation:**
- `username`: 3-30 ký tự, chỉ chữ cái, số, underscore
- `email`: Email hợp lệ
- `password`: Tối thiểu 8 ký tự
- `role`: `student`, `institution`, `admin`, `super_admin`

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {...}
  }
}
```

---

#### PUT /api/admin/users/:id
Cập nhật thông tin user.

**Request Body:** (tất cả các field đều optional)
```json
{
  "username": "updated_username",
  "email": "new@email.com",
  "firstName": "Updated",
  "lastName": "Name",
  "phone": "+9876543210",
  "role": "admin",
  "isActive": true,
  "isEmailVerified": true
}
```

**Lưu ý:**
- Không thể cập nhật password qua endpoint này
- Admin không thể tự demote chính mình
- Email và username phải unique

---

#### DELETE /api/admin/users/:id
Xóa user (soft delete).

**Lưu ý:**
- Admin không thể tự xóa chính mình
- User chỉ bị deactivate, không xóa hẳn khỏi database
- Set `isActive = false` và thêm `deletedAt`, `deletedBy`

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

#### PATCH /api/admin/users/:id/role
Thay đổi role của user.

**Request Body:**
```json
{
  "role": "admin"
}
```

**Lưu ý:**
- Admin không thể tự thay đổi role của chính mình

---

#### PATCH /api/admin/users/:id/status
Kích hoạt/vô hiệu hóa user.

**Request Body:**
```json
{
  "isActive": false,
  "reason": "Violating terms of service"
}
```

**Lưu ý:**
- Admin không thể tự deactivate chính mình
- `reason` là optional nhưng nên cung cấp khi deactivate

---

#### POST /api/admin/users/:id/block
Chặn user.

**Request Body:**
```json
{
  "reason": "Spam activities detected"
}
```

**Effect:**
- Set `isBlocked = true`
- Set `isActive = false`
- Lưu reason, timestamp và admin ID

---

#### POST /api/admin/users/:id/unblock
Bỏ chặn user.

**Response:**
```json
{
  "success": true,
  "message": "User unblocked successfully",
  "data": {
    "user": {...}
  }
}
```

---

#### GET /api/admin/users/:id/activities
Lấy lịch sử hoạt động của user.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "actionType": "login",
        "description": "User logged in",
        "createdAt": "2025-10-14T10:30:00Z",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0..."
      }
    ],
    "pagination": {...}
  }
}
```

---

### Bulk Operations

#### POST /api/admin/users/bulk-delete
Xóa nhiều users cùng lúc.

**Request Body:**
```json
{
  "userIds": ["id1", "id2", "id3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 users deleted successfully",
  "data": {
    "deletedCount": 3
  }
}
```

---

#### POST /api/admin/users/bulk-update-role
Cập nhật role cho nhiều users.

**Request Body:**
```json
{
  "userIds": ["id1", "id2", "id3"],
  "role": "student"
}
```

---

#### GET /api/admin/users/export
Export danh sách users ra file CSV.

**Query Parameters:**
- `role` (string, optional)
- `status` (string, optional)

**Response:**
- Content-Type: `text/csv`
- File download: `users.csv`

---

### Activity Logs

#### GET /api/admin/activities
Lấy danh sách hoạt động của toàn hệ thống.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 50)
- `actionType` (string, optional) - Filter theo loại action
- `userId` (string, optional) - Filter theo user ID

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "_id": "...",
        "userId": {
          "username": "admin_user",
          "email": "admin@example.com"
        },
        "actionType": "user_created",
        "description": "Created user: john@example.com",
        "metadata": {...},
        "createdAt": "2025-10-14T10:30:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

### System Health

#### GET /api/admin/health
Kiểm tra tình trạng hệ thống.

**Response:**
```json
{
  "success": true,
  "data": {
    "health": {
      "status": "healthy",
      "timestamp": "2025-10-14T10:30:00Z",
      "uptime": 86400,
      "memory": {...},
      "version": "v18.17.0"
    }
  }
}
```

---

## 🔒 Security Features

### 1. Role-Based Access Control (RBAC)
- Chỉ `admin` và `super_admin` có quyền truy cập
- Middleware `authorize()` kiểm tra role

### 2. Self-Protection
- Admin không thể tự xóa
- Admin không thể tự demote
- Admin không thể tự deactivate

### 3. Activity Logging
- Mọi hành động đều được log vào database
- Lưu IP address, user agent
- TTL: 90 ngày tự động xóa

### 4. Input Validation
- Joi schema validation
- Sanitization against XSS, NoSQL injection
- Rate limiting

### 5. Data Protection
- Password không bao giờ trả về trong response
- Soft delete thay vì hard delete
- Sensitive fields được select: false

---

## 📊 Action Types (Logged)

```javascript
- user_created
- user_updated
- user_deleted
- user_role_updated
- user_status_updated
- user_blocked
- user_unblocked
- users_bulk_deleted
- users_bulk_role_updated
- institution_approved
- institution_rejected
- login
- logout
- password_changed
- profile_updated
```

---

## ⚠️ Error Responses

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

**Common Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email/username)
- `500` - Internal Server Error

---

## 🧪 Testing với Postman/Thunder Client

### 1. Login để lấy token
```
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "adminpass"
}
```

### 2. Sử dụng token
```
GET /api/admin/users
Headers:
  Authorization: Bearer <your_token_here>
```

---

## 📝 Database Models

### ActivityLog Schema
```javascript
{
  userId: ObjectId (ref: User),
  actionType: String (enum),
  description: String,
  targetResource: {
    resourceType: String,
    resourceId: ObjectId
  },
  metadata: Mixed,
  ipAddress: String,
  userAgent: String,
  status: String (success/failed/pending),
  errorMessage: String,
  createdAt: Date,
  updatedAt: Date
}
```

### User Schema Updates
```javascript
{
  // New fields for admin tracking
  blockedReason: String,
  blockedAt: Date,
  blockedBy: ObjectId (ref: User),
  deactivationReason: String,
  deactivatedAt: Date,
  deactivatedBy: ObjectId (ref: User),
  deletedAt: Date,
  deletedBy: ObjectId (ref: User)
}
```

---

## 🚀 Next Steps

1. ✅ Backend API đã hoàn thành
2. 🔜 Frontend Admin Dashboard
3. 🔜 Real-time notifications với Socket.IO
4. 🔜 Advanced analytics và reporting
5. 🔜 Email notifications

---

## 📞 Support

Nếu có vấn đề, vui lòng tạo issue hoặc liên hệ team phát triển.
