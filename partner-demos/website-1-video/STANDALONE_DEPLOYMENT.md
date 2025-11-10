# 🚀 Partner Website 1 - Standalone Deployment Guide

## 📋 Overview

Partner website 1 hoạt động **độc lập hoàn toàn**, không phụ thuộc vào EduWallet backend.

## 🏗️ Architecture

```
┌─────────────────────┐
│   Partner Website   │
│   (Frontend + API)  │
│   Port: 6001        │
└──────────┬──────────┘
           │
           ├─────────► MongoDB (riêng)
           │           partner1_video_db
           │
           └─────────► EduWallet (webhook only)
                       - Nhận enrollment
                       - Gửi completion
```

## 📦 Requirements

- Node.js >= 16
- MongoDB >= 5.0
- PM2 (for production)

## 🛠️ Installation

### 1. Clone & Install

```bash
cd /www/wwwroot/partner1.mojistudio.vn
npm install
```

### 2. Configure Environment

```bash
cp .env.standalone .env
nano .env
```

Update these values:

```env
MONGODB_URI=mongodb://localhost:27017/partner1_video_db
PARTNER_SECRET=<random-secret-key>
EDUWALLET_WEBHOOK_SECRET=<webhook-secret>
```

### 3. Setup MongoDB

```bash
# Create database
mongosh
use partner1_video_db

# Create collections (auto-created on first insert)
db.courses.insertOne({test: true})
db.enrollments.insertOne({test: true})
db.learningprogress.insertOne({test: true})

# Remove test data
db.courses.deleteMany({test: true})
db.enrollments.deleteMany({test: true})
db.learningprogress.deleteMany({test: true})
```

### 4. Start with PM2

```bash
pm2 start ecosystem.standalone.config.js
pm2 save
```

## 🔌 API Endpoints

### Course Management (Partner)

- `POST /api/courses` - Tạo khóa học
- `GET /api/courses` - Danh sách khóa học
- `GET /api/courses/:id` - Chi tiết khóa học

### Enrollment (EduWallet webhook)

- `POST /api/webhooks/enrollment-created` - Nhận enrollment từ EduWallet

### Learning (Student)

- `POST /api/learning/start` - Bắt đầu học
- `POST /api/learning/progress` - Cập nhật tiến trình
- `POST /api/quiz/submit` - Nộp quiz
- `POST /api/learning/complete` - Hoàn thành (gửi webhook về EduWallet)

### Dashboard

- `GET /api/student/:studentId/dashboard` - Dashboard học sinh
- `GET /api/enrollments/:userId` - Danh sách enrollment

## 🔗 EduWallet Integration

### Webhook Flow

**1. User mua khóa học trên EduWallet:**

```
EduWallet → POST /api/webhooks/enrollment-created
{
  "enrollmentId": "...",
  "userId": "...",
  "courseId": "...",
  "accessUrl": "https://partner1.mojistudio.vn/course/VIDEO123?student=USER_ID"
}
```

**2. User hoàn thành khóa học:**

```
Partner → POST https://api-eduwallet.mojistudio.vn/api/webhooks/partner-updates
{
  "studentId": "...",
  "courseId": "...",
  "status": "Completed",
  "score": 95,
  "completedAt": "2025-11-07T..."
}
```

## 🧪 Testing

### Test API locally

```bash
# Test create course
curl -X POST http://localhost:6001/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Course",
    "courseType": "video",
    "videoId": "dQw4w9WgXcQ",
    "videoDuration": 600,
    "priceEdu": 50
  }'

# Test get courses
curl http://localhost:6001/api/courses

# Health check
curl http://localhost:6001/health
```

## 📊 Monitoring

```bash
# PM2 commands
pm2 list
pm2 logs partner1-video
pm2 restart partner1-video
pm2 stop partner1-video

# Database stats
mongosh partner1_video_db --eval "db.stats()"
mongosh partner1_video_db --eval "db.courses.countDocuments()"
```

## 🔒 Security Checklist

- [ ] Change PARTNER_SECRET in .env
- [ ] Change EDUWALLET_WEBHOOK_SECRET
- [ ] Setup MongoDB authentication
- [ ] Configure firewall (only allow port 6001)
- [ ] Setup HTTPS with SSL certificate
- [ ] Enable MongoDB access control

## 🐛 Troubleshooting

### MongoDB Connection Failed

```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check connection
mongosh mongodb://localhost:27017/partner1_video_db
```

### PM2 Process Crashed

```bash
# View error logs
pm2 logs partner1-video --err --lines 50

# Restart
pm2 restart partner1-video

# Check memory
pm2 monit
```

### Port Already in Use

```bash
# Find process using port 6001
lsof -i :6001

# Kill process
kill -9 <PID>

# Restart PM2
pm2 restart partner1-video
```

## 📞 Support

For issues, contact: partner1@eduwallet.support
