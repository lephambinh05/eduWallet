# 🔧 Khắc phục lỗi MongoDB Connection

## ❌ Lỗi hiện tại
```
MongoDB connection error: MongooseServerSelectionError: connect ECONNREFUSED ::1:27017
Backend server exited with code 1
```

## 🎯 Nguyên nhân
MongoDB chưa được khởi động hoặc chưa được cài đặt.

## ✅ Giải pháp

### **Giải pháp 1: Khởi động MongoDB (Nếu đã cài)**

#### Windows:
```bash
# Cách 1: Sử dụng Services
# Mở Services.msc và tìm "MongoDB", click Start

# Cách 2: Command line
net start MongoDB

# Cách 3: Khởi động thủ công
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

#### macOS:
```bash
# Sử dụng Homebrew
brew services start mongodb-community

# Hoặc khởi động thủ công
mongod --config /usr/local/etc/mongod.conf
```

#### Linux:
```bash
# Ubuntu/Debian
sudo systemctl start mongod

# Hoặc khởi động thủ công
sudo mongod --dbpath /var/lib/mongodb
```

### **Giải pháp 2: Cài đặt MongoDB (Nếu chưa có)**

#### Windows:
1. Tải MongoDB Community Server từ: https://www.mongodb.com/try/download/community
2. Cài đặt với default settings
3. Khởi động MongoDB service

#### macOS:
```bash
# Sử dụng Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux:
```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### **Giải pháp 3: Sử dụng MongoDB Atlas (Cloud)**

1. Tạo tài khoản tại: https://www.mongodb.com/atlas
2. Tạo cluster miễn phí
3. Lấy connection string
4. Cập nhật `.env`:

```env
# Thay thế MONGODB_URI local bằng Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eduwallet?retryWrites=true&w=majority
```

### **Giải pháp 4: Sử dụng Docker (Khuyến nghị)**

```bash
# Khởi động MongoDB với Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest

# Kiểm tra container đang chạy
docker ps
```

## 🚀 Khởi động lại Backend

Sau khi MongoDB đã chạy:

```bash
# Vào thư mục backend
cd backend

# Khởi động lại backend
npm start
```

## ✅ Kiểm tra kết quả

Backend sẽ hiển thị:
```
MongoDB connected successfully!
🚀 EduWallet Backend Server running on http://localhost:3001
📋 Health check: http://localhost:3001/health
```

## 🧪 Test kết nối

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test MongoDB connection
curl http://localhost:3001/api/eduwallet/contract-info
```

## 🆘 Nếu vẫn gặp lỗi

### **Lỗi Port 27017 đã được sử dụng:**
```bash
# Tìm process đang dùng port
netstat -ano | findstr :27017

# Kill process (Windows)
taskkill /PID <PID_NUMBER> /F
```

### **Lỗi Permission:**
```bash
# Tạo thư mục data cho MongoDB
mkdir C:\data\db

# Hoặc sử dụng thư mục khác
mongod --dbpath "C:\your\custom\path"
```

### **Lỗi Authentication:**
```bash
# Kiểm tra .env file
cat .env | grep MONGODB_URI

# Đảm bảo format đúng:
# MONGODB_URI=mongodb://localhost:27017/eduwallet
```

## 📋 Checklist

- [ ] MongoDB đã được cài đặt
- [ ] MongoDB service đang chạy
- [ ] Port 27017 không bị conflict
- [ ] .env có MONGODB_URI đúng
- [ ] Backend khởi động thành công
- [ ] Health endpoint trả về success

## 🎯 Kết quả mong đợi

```
MongoDB connected successfully!
🚀 EduWallet Backend Server running on http://localhost:3001
📋 Health check: http://localhost:3001/health
🔐 Auth endpoints: http://localhost:3001/api/auth/*
👤 User endpoints: http://localhost:3001/api/users/*
🌍 Environment: development
```

**Sau khi backend chạy thành công, hãy khởi động frontend!** 🚀

