# 🔧 QUICK FIX - Mock API đang chạy!

## ✅ Mock Server Status: RUNNING
- URL: http://localhost:5000
- Certificates: 5 items
- LearnPasses: 5 items

## 🎯 HÀNH ĐỘNG NGAY:

### Bước 1: Refresh trình duyệt
```
1. Mở http://localhost:3000/admin/certificates
2. Nhấn Ctrl + Shift + R (hard refresh) hoặc F5
```

### Bước 2: Clear browser cache nếu cần
```
1. Nhấn F12 (mở DevTools)
2. Right-click vào nút Refresh
3. Chọn "Empty Cache and Hard Reload"
```

### Bước 3: Check trong Console
```
1. F12 → Console tab
2. Xem có errors không
3. Check Network tab → XHR
4. Xem requests có đi đến http://localhost:5000 không
```

## 🧪 Test API trực tiếp:

Mở browser và vào:
```
http://localhost:5000/api/admin/certificates
```

Bạn sẽ thấy JSON response với 5 certificates!

## 📊 Expected Result:

Sau khi refresh, bạn sẽ thấy:
- ✅ **Tổng chứng chỉ: 5**
- ✅ **Chứng chỉ đã xác thực: 3**
- ✅ **Chờ xác thực: 2**
- ✅ **Thu hồi: 0**

Và danh sách 5 certificates:
1. Nguyễn Văn A - Blockchain Fundamentals (Verified)
2. Trần Thị B - Smart Contract Development (Pending)
3. Lê Văn C - DApp Development (Verified)
4. Phạm Thị D - Web3 Security (Verified)
5. Hoàng Văn E - NFT & Digital Assets (Pending)

## ❌ Nếu vẫn thấy 0:

1. **Check .env file:**
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

2. **Restart frontend:**
   - Stop frontend (Ctrl+C in terminal)
   - Run: `npm start`

3. **Check adminService.js:**
   - Line 3 should be: `const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';`

## 🚀 NẾU HOẠT ĐỘNG:

Chụp screenshot và báo cáo:
- ✅ Numbers hiển thị đúng (5, 3, 2, 0)
- ✅ Certificate cards hiển thị
- ✅ LearnPass cards hiển thị
- ✅ Filters hoạt động
- ✅ Detail modal mở được

**THỬ NGAY!** 🎉
