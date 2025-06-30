# EduWallet - NFT Learning Passport

Ứng dụng quản lý chứng chỉ, danh tính số và phần thưởng học tập trên blockchain với giao diện hiện đại và responsive.

## ✨ Tính năng mới

### 🎨 Giao diện cải tiến
- **Sidebar Navigation**: Menu điều hướng dọc thay vì ngang, tiết kiệm không gian và dễ sử dụng
- **Responsive Design**: Tối ưu cho mọi thiết bị từ desktop đến mobile
- **Smooth Animations**: Chuyển động mượt mà với Framer Motion
- **Modern UI**: Thiết kế glassmorphism với gradient và blur effects

### 🔧 Components mới
- `Sidebar`: Menu điều hướng dọc với collapse/expand
- `Layout`: Quản lý layout chung cho toàn bộ ứng dụng
- `PageWrapper`: Wrapper cho các trang với animation
- `LoadingSpinner`: Spinner loading với animation
- `ErrorBoundary`: Xử lý lỗi graceful

### 📱 Responsive Features
- **Desktop**: Sidebar luôn mở, hiển thị đầy đủ thông tin
- **Tablet**: Sidebar có thể thu gọn, tối ưu không gian
- **Mobile**: Sidebar ẩn, hiển thị khi cần với overlay

## 🚀 Cách sử dụng

### Khởi chạy ứng dụng
```bash
npm start
```

### Cấu trúc thư mục
```
src/
├── components/
│   ├── Sidebar.js          # Menu điều hướng dọc
│   ├── Layout.js           # Layout chung
│   ├── PageWrapper.js      # Wrapper cho trang
│   ├── LoadingSpinner.js   # Loading spinner
│   ├── ErrorBoundary.js    # Xử lý lỗi
│   └── ...
├── pages/                  # Các trang của ứng dụng
├── context/               # Context providers
└── utils/                 # Utilities
```

### Sử dụng PageWrapper
```jsx
import PageWrapper from '../components/PageWrapper';

const MyPage = () => (
  <PageWrapper>
    {/* Nội dung trang */}
  </PageWrapper>
);
```

### Sử dụng LoadingSpinner
```jsx
import LoadingSpinner from '../components/LoadingSpinner';

const LoadingComponent = () => (
  <LoadingSpinner text="Đang tải dữ liệu..." />
);
```

## 🎯 Tính năng chính

### 🔐 Authentication
- Đăng nhập/Đăng ký
- Protected Routes
- User session management

### 💰 Wallet Integration
- Kết nối ví blockchain
- Quản lý địa chỉ ví
- Sao chép địa chỉ

### 📚 Learning Management
- Dashboard tổng quan
- LearnPass - Hộ chiếu học tập
- Badges và thành tích
- Marketplace đổi thưởng

### 🔄 Transfer System
- Chuyển tiền giữa các ví
- Lịch sử giao dịch
- Xác thực giao dịch

## 🛠️ Công nghệ sử dụng

- **React 18** - UI Framework
- **React Router** - Routing
- **Styled Components** - CSS-in-JS
- **Framer Motion** - Animations
- **React Query** - Data fetching
- **Socket.io** - Real-time communication
- **React Hot Toast** - Notifications

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎨 Theme Colors

- **Primary**: #a259ff (Purple)
- **Secondary**: #3772ff (Blue)
- **Background**: Gradient từ #0c0c0c đến #533483
- **Text**: #ffffff (White)
- **Muted**: rgba(255, 255, 255, 0.7)

## 🔧 Development

### Cài đặt dependencies
```bash
npm install
```

### Chạy development server
```bash
npm start
```

### Build production
```bash
npm run build
```

## 📝 Changelog

### v2.0.0 - UI/UX Overhaul
- ✅ Chuyển đổi từ navbar ngang sang sidebar dọc
- ✅ Cải thiện responsive design
- ✅ Thêm smooth animations
- ✅ Tối ưu performance
- ✅ Cải thiện accessibility
- ✅ Thêm error handling
- ✅ Loading states

### v1.0.0 - Initial Release
- ✅ Basic authentication
- ✅ Wallet integration
- ✅ Learning management
- ✅ Transfer system

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 