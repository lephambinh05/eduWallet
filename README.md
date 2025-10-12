# EduWallet - NFT Learning Passport Platform

## 📖 Tổng quan dự án

**EduWallet** là một nền tảng quản lý chứng chỉ học tập và danh tính số dựa trên công nghệ blockchain. Ứng dụng cho phép sinh viên và học viên quản lý, lưu trữ và xác thực các chứng chỉ học tập dưới dạng NFT (Non-Fungible Token), tạo ra một hệ sinh thái học tập minh bạch và bảo mật.

### 🎯 Mục tiêu chính
- **Số hóa chứng chỉ**: Chuyển đổi chứng chỉ học tập thành NFT trên blockchain
- **Quản lý danh tính số**: Tạo hộ chiếu học tập (LearnPass) duy nhất cho mỗi người dùng
- **Hệ thống phần thưởng**: Tích hợp marketplace để đổi điểm học tập lấy phần thưởng
- **Giao diện hiện đại**: Thiết kế responsive với UX/UI tối ưu

## 🏗️ Kiến trúc hệ thống

### Frontend (React Application)
- **Framework**: React 18 với Hooks và Context API
- **Routing**: React Router v6 cho Single Page Application
- **Styling**: Styled Components với thiết kế glassmorphism
- **Animations**: Framer Motion cho hiệu ứng mượt mà
- **State Management**: React Context + Local Storage
- **Real-time**: Socket.io client cho thông báo real-time

### Backend (Express Server)
- **Framework**: Express.js với Socket.io
- **Real-time**: WebSocket cho thông báo tức thời
- **CORS**: Hỗ trợ cross-origin requests
- **Port**: 3001 (tách biệt với frontend)

### Blockchain Integration
- **Network**: Polygon Mumbai Testnet
- **Wallet**: MetaMask integration
- **Library**: Ethers.js v5 cho tương tác blockchain
- **Token**: EDU Token (ERC-20) cho hệ thống phần thưởng

## 📁 Cấu trúc dự án chi tiết

```
eduWallet/
├── 📁 public/                          # Static files
│   └── index.html                      # HTML template chính
│
├── 📁 src/                             # Source code chính
│   ├── 📄 App.js                       # Component gốc, routing chính
│   ├── 📄 index.js                     # Entry point của ứng dụng
│   ├── 📄 index.css                    # Global styles
│   │
│   ├── 📁 components/                  # Reusable components
│   │   ├── 📄 ErrorBoundary.js         # Xử lý lỗi React
│   │   ├── 📄 Footer.js                # Footer component
│   │   ├── 📄 Layout.js                # Layout wrapper chính
│   │   ├── 📄 LoadingSpinner.js        # Loading animation
│   │   ├── 📄 Navbar.js                # Navigation bar (legacy)
│   │   ├── 📄 PageWrapper.js           # Page wrapper với animation
│   │   ├── 📄 ProtectedRoute.js        # Route bảo vệ yêu cầu đăng nhập
│   │   └── 📄 Sidebar.js               # Sidebar navigation chính
│   │
│   ├── 📁 context/                     # React Context providers
│   │   └── 📄 WalletContext.js         # Quản lý trạng thái ví blockchain
│   │
│   ├── 📁 data/                        # Static data và mock data
│   │   ├── 📄 demoData.json            # Dữ liệu demo cho chứng chỉ, badges
│   │   └── 📄 users.json               # Dữ liệu người dùng mẫu
│   │
│   ├── 📁 pages/                       # Các trang của ứng dụng
│   │   ├── 📄 About.js                 # Trang giới thiệu
│   │   ├── 📄 Badges.js                # Trang quản lý badges/thành tích
│   │   ├── 📄 Dashboard.js             # Trang tổng quan chính
│   │   ├── 📄 Home.js                  # Trang chủ
│   │   ├── 📄 LearnPass.js             # Trang hộ chiếu học tập (NFT)
│   │   ├── 📄 Login.js                 # Trang đăng nhập
│   │   ├── 📄 Marketplace.js           # Trang marketplace đổi thưởng
│   │   ├── 📄 Register.js              # Trang đăng ký
│   │   ├── 📄 Transfer.js              # Trang chuyển tiền/token
│   │   └── 📄 Verify.js                # Trang xác thực chứng chỉ
│   │
│   └── 📁 utils/                       # Utility functions
│       ├── 📄 socket.js                # Socket.io client configuration
│       └── 📄 userUtils.js             # User management utilities
│
├── 📁 server/                          # Backend server
│   ├── 📄 index.js                     # Express server chính
│   ├── 📄 package.json                 # Server dependencies
│   └── 📄 package-lock.json            # Server lock file
│
├── 📁 css/                             # Static CSS files
│   ├── 📄 bootstrap.min.css            # Bootstrap CSS framework
│   └── 📄 style.css                    # Custom styles
│
├── 📁 img/                             # Static images
│   ├── 📄 about.png                    # About page image
│   ├── 📄 hero-1.png, hero-2.png       # Hero section images
│   ├── 📄 icon-1.png → icon-10.png     # Feature icons
│   └── 📄 payment-1.png → payment-4.png # Payment method images
│
├── 📁 lib/                             # Third-party libraries
│   ├── 📁 animate/                     # Animation library
│   │   ├── 📄 animate.css
│   │   └── 📄 animate.min.css
│   ├── 📁 counterup/                   # Counter animation
│   │   └── 📄 counterup.min.js
│   ├── 📁 easing/                      # Easing functions
│   │   ├── 📄 easing.js
│   │   └── 📄 easing.min.js
│   ├── 📁 owlcarousel/                 # Carousel library
│   │   ├── 📁 assets/                  # Carousel assets
│   │   ├── 📄 owl.carousel.js
│   │   └── 📄 owl.carousel.min.js
│   ├── 📁 waypoints/                   # Scroll waypoints
│   │   ├── 📄 links.php
│   │   └── 📄 waypoints.min.js
│   └── 📁 wow/                         # WOW.js animation
│       ├── 📄 wow.js
│       └── 📄 wow.min.js
│
├── 📁 scss/                            # SCSS source files
│   ├── 📄 bootstrap.scss               # Bootstrap SCSS entry
│   └── 📁 bootstrap/                   # Bootstrap SCSS source
│       └── 📁 scss/                    # Bootstrap components
│
├── 📁 node_modules/                    # Node.js dependencies
├── 📄 package.json                     # Main project dependencies
├── 📄 package-lock.json                # Dependency lock file
├── 📄 start-app.bat                    # Windows batch file để khởi chạy
├── 📄 README.md                        # Tài liệu dự án
└── 📄 TROUBLESHOOTING.md               # Hướng dẫn khắc phục sự cố
```

## 🚀 Tính năng chính

### 🔐 Hệ thống xác thực
- **Đăng ký/Đăng nhập**: Form validation với React
- **Protected Routes**: Bảo vệ các trang yêu cầu đăng nhập
- **Session Management**: Lưu trữ thông tin user trong localStorage
- **User Profile**: Quản lý thông tin cá nhân

### 💰 Tích hợp ví blockchain
- **MetaMask Integration**: Kết nối ví MetaMask
- **Network Management**: Tự động chuyển sang Polygon Mumbai Testnet
- **Account Management**: Quản lý địa chỉ ví và số dư
- **Transaction History**: Theo dõi lịch sử giao dịch

### 📚 Quản lý học tập
- **Dashboard**: Tổng quan thống kê học tập
- **LearnPass NFT**: Hộ chiếu học tập dưới dạng NFT
- **Certificate Management**: Quản lý chứng chỉ học tập
- **Badge System**: Hệ thống thành tích và huy hiệu
- **Credit Tracking**: Theo dõi tín chỉ học tập

### 🛒 Marketplace
- **Reward Exchange**: Đổi điểm học tập lấy phần thưởng
- **Token Economy**: Sử dụng EDU Token
- **Voucher System**: Hệ thống voucher và coupon
- **Transaction History**: Lịch sử giao dịch marketplace

### 🔄 Hệ thống chuyển tiền
- **Peer-to-Peer Transfer**: Chuyển tiền giữa người dùng
- **Real-time Notifications**: Thông báo tức thời qua Socket.io
- **Transaction Verification**: Xác thực giao dịch
- **Balance Management**: Quản lý số dư tài khoản

### 🎨 Giao diện người dùng
- **Responsive Design**: Tối ưu cho mọi thiết bị
- **Sidebar Navigation**: Menu điều hướng dọc hiện đại
- **Smooth Animations**: Hiệu ứng chuyển động mượt mà
- **Glassmorphism UI**: Thiết kế trong suốt hiện đại
- **Dark Theme**: Giao diện tối với gradient màu

## 🛠️ Công nghệ sử dụng

### Frontend Stack
- **React 18.2.0** - UI Framework chính
- **React Router DOM 6.3.0** - Client-side routing
- **Styled Components 5.3.9** - CSS-in-JS styling
- **Framer Motion 10.0.1** - Animation library
- **React Query 3.39.3** - Data fetching và caching
- **React Hot Toast 2.5.2** - Notification system
- **React Icons 4.8.0** - Icon library
- **React Copy to Clipboard 5.1.0** - Copy functionality
- **React CountUp 6.4.2** - Number animation
- **React Dropzone 14.2.3** - File upload
- **React QR Code 2.0.12** - QR code generation
- **React Intersection Observer 9.4.3** - Scroll animations

### Blockchain & Web3
- **Ethers.js 5.7.2** - Ethereum library
- **Web3 4.16.0** - Web3 integration
- **MetaMask** - Wallet integration

### Backend & Real-time
- **Express.js 5.1.0** - Web server
- **Socket.io 4.8.1** - Real-time communication
- **CORS 2.8.5** - Cross-origin resource sharing

### Development Tools
- **React Scripts 5.0.1** - Build tools
- **Axios 1.3.4** - HTTP client
- **Testing Library** - Unit testing
- **Web Vitals 2.1.4** - Performance monitoring

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px - Sidebar ẩn, hiển thị overlay
- **Tablet**: 768px - 1024px - Sidebar có thể thu gọn
- **Desktop**: > 1024px - Sidebar luôn mở

### Design System
- **Primary Color**: #a259ff (Purple)
- **Secondary Color**: #3772ff (Blue)
- **Background**: Gradient từ #0c0c0c đến #533483
- **Text**: #ffffff (White)
- **Muted Text**: rgba(255, 255, 255, 0.7)
- **Font**: Inter (Google Fonts)

## 🚀 Hướng dẫn cài đặt và chạy

### Yêu cầu hệ thống
- **Node.js**: >= 14.0.0
- **npm**: >= 6.0.0
- **MetaMask**: Extension trình duyệt
- **Trình duyệt**: Chrome, Firefox, Safari (phiên bản mới)

### Cài đặt dependencies
```bash
# Cài đặt dependencies chính
npm install

# Cài đặt dependencies cho server
cd server
npm install
cd ..
```

### Khởi chạy ứng dụng

#### Cách 1: Sử dụng batch file (Windows)
```bash
# Chạy file batch để khởi động cả frontend và backend
start-app.bat
```

#### Cách 2: Khởi chạy thủ công
```bash
# Terminal 1: Khởi động backend server
cd server
npm start

# Terminal 2: Khởi động frontend
npm start
```

### Truy cập ứng dụng
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## 🔧 Scripts có sẵn

```bash
# Development
npm start              # Khởi động development server
npm run build          # Build production
npm test               # Chạy tests
npm run eject          # Eject từ Create React App

# Server
cd server
npm start              # Khởi động Express server
```

## 📊 Cấu trúc dữ liệu

### User Data
```json
{
  "id": "u001",
  "name": "Nguyễn Văn A",
  "email": "vana@example.com",
  "wallet": "0x1234...abcd",
  "learnPassId": "lp001"
}
```

### LearnPass NFT
```json
{
  "id": "lp001",
  "owner": "u002",
  "nftImage": "/nft_learnpass.png",
  "metadata": {
    "courses": [...],
    "extracurricular": [...],
    "creditHistory": [...]
  }
}
```

### Certificate
```json
{
  "id": "c001",
  "title": "Trí Tuệ Nhân Tạo",
  "issuer": "Trường Đại học Ngoại Ngữ - Tin Học",
  "date": "2024-05-01",
  "score": 9.5,
  "skills": ["Blockchain", "Smart Contract"],
  "image": "/cert_blockchain.png"
}
```

## 🔒 Bảo mật

### Frontend Security
- **Input Validation**: Validate tất cả input từ user
- **XSS Protection**: Sanitize HTML content
- **CSRF Protection**: Sử dụng tokens cho API calls
- **Secure Storage**: Mã hóa dữ liệu nhạy cảm trong localStorage

### Blockchain Security
- **Private Key Management**: Không lưu trữ private key
- **Transaction Verification**: Xác thực tất cả giao dịch
- **Network Validation**: Kiểm tra network trước khi giao dịch
- **Gas Optimization**: Tối ưu gas fee cho giao dịch

## 🧪 Testing

### Unit Testing
```bash
npm test                    # Chạy tất cả tests
npm test -- --coverage     # Chạy với coverage report
npm test -- --watch        # Watch mode
```

### Manual Testing
- **Authentication Flow**: Đăng ký, đăng nhập, đăng xuất
- **Wallet Integration**: Kết nối ví, chuyển đổi network
- **NFT Operations**: Tạo, xem, chuyển NFT
- **Responsive Design**: Test trên các thiết bị khác nhau

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
```bash
# .env file
REACT_APP_API_URL=http://localhost:3001
REACT_APP_CHAIN_ID=80001
REACT_APP_NETWORK_NAME=Polygon Mumbai
```

### Deployment Platforms
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Heroku, Railway, DigitalOcean
- **Blockchain**: Polygon Mainnet (production)

## 📝 Changelog

### v2.0.0 - UI/UX Overhaul (Current)
- ✅ Chuyển đổi từ navbar ngang sang sidebar dọc
- ✅ Cải thiện responsive design cho mobile/tablet
- ✅ Thêm smooth animations với Framer Motion
- ✅ Tối ưu performance và loading states
- ✅ Cải thiện accessibility và keyboard navigation
- ✅ Thêm error boundary và error handling
- ✅ Glassmorphism design với gradient effects

### v1.0.0 - Initial Release
- ✅ Basic authentication system
- ✅ MetaMask wallet integration
- ✅ LearnPass NFT functionality
- ✅ Certificate management
- ✅ Badge system
- ✅ Marketplace with EDU tokens
- ✅ Transfer system
- ✅ Real-time notifications

## 🐛 Khắc phục sự cố

Xem file [TROUBLESHOOTING.md](TROUBLESHOOTING.md) để biết chi tiết về:
- Lỗi thường gặp và cách khắc phục
- Các lệnh hữu ích
- Kiểm tra ứng dụng
- Liên hệ hỗ trợ

## 🤝 Đóng góp

### Quy trình đóng góp
1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

### Coding Standards
- **ESLint**: Tuân thủ React coding standards
- **Prettier**: Format code tự động
- **Conventional Commits**: Sử dụng conventional commit messages
- **Component Structure**: Functional components với hooks

## 📄 License

Dự án này được cấp phép theo MIT License - xem file [LICENSE](LICENSE) để biết chi tiết.

## 📞 Liên hệ

- **Developer**: [Tên Developer]
- **Email**: [email@example.com]
- **GitHub**: [github.com/username]
- **Project URL**: [project-url.com]

---

**EduWallet** - Nền tảng NFT Learning Passport cho tương lai giáo dục số hóa! 🎓✨ 