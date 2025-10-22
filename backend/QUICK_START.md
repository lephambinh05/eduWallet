# 🚀 Quick Start Guide - Admin Backend

## 📋 Prerequisites

- Node.js v16+ đã cài đặt
- MongoDB đang chạy
- Backend dependencies đã cài đặt (`npm install`)

---

## ⚡ Quick Start (5 phút)

### Bước 1: Tạo Admin User đầu tiên

```bash
cd eduWallet/backend
node create-admin.js
```

Nhập thông tin admin:
```
Username: admin
Email: admin@example.com
Password: Admin123456
First Name: Admin
Last Name: User
```

### Bước 2: Chạy Backend Server

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3001`

### Bước 3: Test API (Optional)

Mở terminal mới:
```bash
node test-admin-api.js
```

**Lưu ý:** Cập nhật email/password trong `test-admin-api.js` nếu cần.

---

## 🔑 Login và lấy Token

### Sử dụng Postman/Thunder Client:

**Request:**
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

**Copy token** và sử dụng cho các request tiếp theo.

---

## 📊 Test Admin Endpoints

### 1. Get Dashboard Stats

```
GET http://localhost:3001/api/admin/dashboard
Authorization: Bearer YOUR_TOKEN_HERE
```

### 2. Get All Users

```
GET http://localhost:3001/api/admin/users?page=1&limit=20
Authorization: Bearer YOUR_TOKEN_HERE
```

### 3. Create User

```
POST http://localhost:3001/api/admin/users
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "Pass123456",
  "firstName": "New",
  "lastName": "User",
  "dateOfBirth": "2000-01-01",
  "role": "student"
}
```

### 4. Update User

```
PUT http://localhost:3001/api/admin/users/USER_ID
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name"
}
```

### 5. Delete User

```
DELETE http://localhost:3001/api/admin/users/USER_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📁 Postman Collection

Import collection này vào Postman:

```json
{
  "info": {
    "name": "EduWallet Admin API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"Admin123456\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Admin",
      "item": [
        {
          "name": "Get Dashboard",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/admin/dashboard",
              "host": ["{{baseUrl}}"],
              "path": ["admin", "dashboard"]
            }
          }
        },
        {
          "name": "Get All Users",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/admin/users?page=1&limit=20",
              "host": ["{{baseUrl}}"],
              "path": ["admin", "users"],
              "query": [
                {"key": "page", "value": "1"},
                {"key": "limit", "value": "20"}
              ]
            }
          }
        },
        {
          "name": "Create User",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"email\": \"test@example.com\",\n  \"password\": \"Test123456\",\n  \"firstName\": \"Test\",\n  \"lastName\": \"User\",\n  \"dateOfBirth\": \"2000-01-01\",\n  \"role\": \"student\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/admin/users",
              "host": ["{{baseUrl}}"],
              "path": ["admin", "users"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001/api",
      "type": "string"
    },
    {
      "key": "token",
      "value": "",
      "type": "string"
    }
  ]
}
```

**Cách dùng:**
1. Import vào Postman
2. Login để lấy token
3. Copy token vào variable `{{token}}`
4. Test các endpoints khác

---

## 🔍 Common Issues & Solutions

### Issue 1: "Cannot find module 'mongoose'"
**Solution:**
```bash
cd eduWallet/backend
npm install
```

### Issue 2: "MongoDB connection failed"
**Solution:**
- Kiểm tra MongoDB đang chạy: `mongosh` hoặc `mongo`
- Kiểm tra MONGODB_URI trong `.env`
- Khởi động MongoDB: `mongod` hoặc start service

### Issue 3: "User already exists"
**Solution:**
- User với email/username đó đã tồn tại
- Dùng email/username khác
- Hoặc xóa user cũ trong MongoDB

### Issue 4: "Invalid token" / "Token expired"
**Solution:**
- Login lại để lấy token mới
- Kiểm tra JWT_SECRET trong `.env`
- Token có thời hạn 7 ngày

### Issue 5: Port 3001 already in use
**Solution:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Hoặc đổi PORT trong .env
PORT=3002
```

---

## 📝 Environment Variables

Tạo file `.env` trong `eduWallet/backend/`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/eduwallet

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Server
PORT=3001
HOST=localhost
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

---

## 🎯 Next Actions

### ✅ Backend Done
- [x] Admin API endpoints
- [x] Authentication & Authorization
- [x] Validation
- [x] Logging
- [x] Documentation

### 🔜 Frontend To-Do
1. Tạo Admin Login page
2. Tạo Admin Dashboard
3. Tạo User Management page
4. Tích hợp API calls
5. Add notifications & error handling

### 📚 Read More
- Full API docs: `ADMIN_API_DOCS.md`
- Implementation summary: `ADMIN_BACKEND_SUMMARY.md`
- Test all endpoints: `node test-admin-api.js`

---

## 🆘 Need Help?

1. Check logs: `eduWallet/backend/logs/`
2. Review error messages
3. Check MongoDB collections
4. Test with Postman first
5. Review API documentation

---

**Happy Coding! 🚀**
