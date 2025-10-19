# EduWallet Smart Contract Deployment

Dự án deploy smart contract EduWallet lên Pione zerochain (PZO) sử dụng Hardhat.

## Tổng quan

EduWalletDataStore là smart contract quản lý dữ liệu học tập trên blockchain, bao gồm:
- 📚 **Learning Records**: Học bạ, chứng chỉ, điểm số
- 🏆 **Badges**: Huy hiệu, thành tích học tập
- 💼 **Portfolios**: Portfolio dự án của sinh viên
- 🔐 **Authorization**: Quản lý quyền issuer (trường học, tổ chức)

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` từ `env.example`:
```bash
cp env.example .env
```

3. Cập nhật file `.env` với thông tin của bạn:
```
RPC_URL=https://rpc.zeroscan.org
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=
```

## Sử dụng

1. Compile smart contract:
```bash
npm run compile
```

2. Deploy lên PZO network:
```bash
npm run deploy
```

3. Sau khi deploy thành công, copy CONTRACT_ADDRESS vào file `.env`

## Cấu trúc project

- `contracts/EduWalletDataStore.sol` - Smart contract chính
- `scripts/deploy.js` - Script deploy
- `hardhat.config.js` - Cấu hình Hardhat
- `env.example` - Template cho biến môi trường

## Smart Contract Features

### 📚 Learning Records
- Thêm học bạ mới (chỉ issuer được phép)
- Lưu trữ: tên sinh viên, trường, khóa học, điểm số, hash chứng chỉ
- Xác minh và timestamp tự động

### 🏆 Badges
- Tạo badge mới cho sinh viên
- Lưu trữ: tên, mô tả, hình ảnh, ngày nhận
- Quản lý trạng thái active/inactive

### 💼 Portfolios
- Sinh viên tự tạo portfolio
- Lưu trữ: tiêu đề, mô tả, hash dự án, kỹ năng
- Liên kết với địa chỉ ví của sinh viên

### 🔐 Authorization
- Owner có thể ủy quyền issuer mới
- Issuer được phép thêm học bạ và badge
- Sinh viên có thể tạo portfolio

## Functions chính

```solidity
// Thêm học bạ
addLearningRecord(studentName, institution, courseName, certificateHash, score, student)

// Tạo badge
earnBadge(name, description, imageHash, student)

// Tạo portfolio
createPortfolio(title, description, projectHash, skills)

// Ủy quyền issuer
authorizeIssuer(issuer, authorized)

// Lấy dữ liệu
getLearningRecord(id)
getBadge(id)
getPortfolio(id)
getStudentRecords(student)
getStudentBadges(student)
getStudentPortfolios(student)
```

## Network

- **PZO Network**: https://rpc.zeroscan.org
- **Chain ID**: 5080

## Events

- `LearningRecordAdded` - Khi thêm học bạ mới
- `BadgeEarned` - Khi sinh viên nhận badge
- `PortfolioCreated` - Khi tạo portfolio mới
- `IssuerAuthorized` - Khi ủy quyền issuer mới
