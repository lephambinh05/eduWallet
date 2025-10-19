# 🚀 Hướng dẫn khởi động Backend

## ❌ **Lỗi hiện tại:**
```
curl: (7) Failed to connect to localhost port 3001 after 2229 ms: Could not connect to server
```

**Nguyên nhân:** Backend chưa được khởi động!

## ✅ **Cách khắc phục:**

### **Bước 1: Khởi động Backend**
```bash
# Mở terminal mới
cd backend
npm start
```

### **Bước 2: Kiểm tra Backend đã chạy**
```bash
# Terminal sẽ hiển thị:
🚀 Backend server starting...
📡 Server running on port 3001
🔗 MongoDB connected successfully
✅ All services ready!
```

### **Bước 3: Test API**
```bash
# Mở terminal khác
curl http://localhost:3001/api/eduwallet/contract-info
```

## 🔧 **Nếu gặp lỗi MongoDB:**

### **Lỗi MongoDB connection:**
```
MongoDB connection error: connect ECONNREFUSED ::1:27017
```

### **Cách khắc phục:**

#### **Option 1: Khởi động MongoDB Service**
```bash
# Windows
net start MongoDB

# Hoặc mở Services.msc → Tìm MongoDB → Start
```

#### **Option 2: Khởi động MongoDB bằng Docker**
```bash
cd backend
docker-compose up -d
```

#### **Option 3: Khởi động MongoDB thủ công**
```bash
# Tìm thư mục MongoDB
cd "C:\Program Files\MongoDB\Server\7.0\bin"
mongod --dbpath "C:\data\db"
```

## 🎯 **Thứ tự khởi động đúng:**

### **1. Khởi động MongoDB trước:**
```bash
# Option A: Service
net start MongoDB

# Option B: Docker
cd backend
docker-compose up -d

# Option C: Manual
mongod --dbpath "C:\data\db"
```

### **2. Khởi động Backend:**
```bash
cd backend
npm start
```

### **3. Khởi động Frontend:**
```bash
cd src
npm start
```

## 🔍 **Kiểm tra trạng thái:**

### **Kiểm tra MongoDB:**
```bash
# Test MongoDB connection
mongo --eval "db.adminCommand('ismaster')"
```

### **Kiểm tra Backend:**
```bash
# Test API
curl http://localhost:3001/api/eduwallet/contract-info

# Hoặc mở browser
http://localhost:3001
```

### **Kiểm tra Frontend:**
```bash
# Mở browser
http://localhost:3000
```

## 🚨 **Troubleshooting:**

### **Port 3001 đã được sử dụng:**
```bash
# Tìm process sử dụng port 3001
netstat -ano | findstr :3001

# Kill process (thay PID bằng số thực)
taskkill /PID <PID> /F
```

### **MongoDB không khởi động:**
```bash
# Kiểm tra log MongoDB
tail -f "C:\Program Files\MongoDB\Server\7.0\log\mongod.log"

# Hoặc khởi động với log
mongod --dbpath "C:\data\db" --logpath "C:\data\log\mongod.log"
```

## 🎉 **Kết quả mong đợi:**

### **Backend chạy thành công:**
```
🚀 Backend server starting...
📡 Server running on port 3001
🔗 MongoDB connected successfully
✅ All services ready!
```

### **API test thành công:**
```bash
curl http://localhost:3001/api/eduwallet/contract-info

# Kết quả:
{
  "success": true,
  "data": {
    "contractAddress": "0x1234567890abcdef...",
    "network": "pioneZero",
    "chainId": "5080"
  }
}
```

## 🚀 **Bước tiếp theo:**

1. ✅ Khởi động MongoDB
2. ✅ Khởi động Backend  
3. ✅ Test API
4. ✅ Khởi động Frontend
5. ✅ Test tạo Portfolio NFT

**Hãy thử khởi động backend và cho tôi biết kết quả!**
