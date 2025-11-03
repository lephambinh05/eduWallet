# Partner Demo Websites

Đây là 3 website demo của đối tác để minh họa tích hợp với EduWallet qua API và webhooks.

## Cấu trúc

- **website-1-video**: Website demo xem video YouTube với tính năng tracking tiến trình và điểm
- **website-2-quiz**: Website demo làm quiz (2 task × 5 câu hỏi)
- **website-3-hybrid**: Website demo kết hợp video và quiz

## Yêu cầu

- Node.js >= 14
- npm hoặc yarn

## Cài đặt

```bash
# Vào từng folder và cài đặt
cd website-1-video
npm install

cd ../website-2-quiz
npm install

cd ../website-3-hybrid
npm install
```

## Chạy từng website

### Website 1 (Video)
```bash
cd website-1-video
npm start
# Mở http://localhost:3001
```

### Website 2 (Quiz)
```bash
cd website-2-quiz
npm start
# Mở http://localhost:3002
```

### Website 3 (Hybrid)
```bash
cd website-3-hybrid
npm start
# Mở http://localhost:3003
```

## Tích hợp với EduWallet

Mỗi website sẽ gửi kết quả học tập về EduWallet thông qua:
- **Endpoint**: `POST /api/webhooks/partner-updates`
- **Authentication**: HMAC-SHA256 signature
- **Headers**:
  - `X-Partner-Id`: ID đối tác
  - `X-Partner-Timestamp`: Unix timestamp
  - `X-Partner-Signature`: sha256=<hex_hmac>

Xem file `PARTNER_API_DEMO.md` để biết thêm chi tiết về cách ký và gửi dữ liệu.
