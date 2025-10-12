# EduWallet Smart Contracts

## Tổng quan

EduWallet Smart Contracts là bộ hợp đồng thông minh cho nền tảng quản lý chứng chỉ học tập và danh tính số dựa trên blockchain. Hệ thống sử dụng công nghệ NFT và ERC-20 token để tạo ra một hệ sinh thái giáo dục minh bạch và bảo mật.

## Kiến trúc hệ thống

```
EduWallet Ecosystem
├── EDUToken (ERC-20)           # Token phần thưởng
├── LearnPassNFT (ERC-721)      # Hộ chiếu học tập
├── CertificateNFT (ERC-721)    # Chứng chỉ học tập
├── EduWalletFactory            # Factory quản lý hệ thống
└── EduWalletMarketplace        # Marketplace đổi thưởng
```

## Contracts Overview

### 1. EDUToken.sol
- **Chức năng**: ERC-20 token cho hệ thống phần thưởng
- **Tính năng chính**:
  - Minting rewards cho các hoạt động học tập
  - Quản lý institutions được xác thực
  - Reward pools cho các loại hoạt động khác nhau
  - Pausable và burnable functionality

### 2. LearnPassNFT.sol
- **Chức năng**: NFT đại diện cho hộ chiếu học tập của sinh viên
- **Tính năng chính**:
  - Lưu trữ thông tin sinh viên và học tập
  - Quản lý course completions và grades
  - Hệ thống badges và thành tích
  - Role-based access control

### 3. CertificateNFT.sol
- **Chức năng**: NFT đại diện cho chứng chỉ học tập
- **Tính năng chính**:
  - Issuance và verification của certificates
  - Tracking skills và achievements
  - Revocation mechanism
  - Authenticity verification

### 4. EduWalletFactory.sol
- **Chức năng**: Factory contract quản lý toàn bộ hệ thống
- **Tính năng chính**:
  - Quản lý institutions
  - Tạo LearnPass và Certificates
  - Phân phối rewards
  - System statistics

### 5. EduWalletMarketplace.sol
- **Chức năng**: Marketplace cho việc đổi EDU tokens lấy rewards
- **Tính năng chính**:
  - Product management
  - Purchase system
  - Order tracking
  - Fee management

## Cài đặt và Setup

### Yêu cầu hệ thống
- Node.js >= 16.0.0
- npm hoặc yarn
- Hardhat
- MetaMask

### Cài đặt dependencies

```bash
npm install
```

### Cấu hình environment

```bash
cp env.example .env
# Chỉnh sửa .env với thông tin của bạn
```

### Compile contracts

```bash
npm run compile
```

### Chạy tests

```bash
npm test
```

### Deploy contracts

```bash
# Deploy lên local network
npm run deploy:local

# Deploy lên Mumbai testnet
npm run deploy:mumbai
```

## Network Configuration

### Pione Zero Chain
- **Chain ID**: 5080
- **RPC URL**: https://rpc.zeroscan.org
- **Explorer**: https://zeroscan.org
- **Currency**: PZO

### Pione Chain
- **Chain ID**: 5090
- **RPC URL**: https://rpc.pionescan.com
- **Explorer**: https://scan.pionechain.com
- **Currency**: PIO

### Polygon Mainnet (Backup)
- **Chain ID**: 137
- **RPC URL**: https://polygon-rpc.com/
- **Explorer**: https://polygonscan.com/
- **Currency**: MATIC

## Contract Addresses

Sau khi deploy, contract addresses sẽ được lưu trong file `deployments/{network}.json`.

## Usage Examples

### 1. Kết nối với contracts

```javascript
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const factory = new ethers.Contract(
  FACTORY_ADDRESS,
  FACTORY_ABI,
  signer
);
```

### 2. Tạo LearnPass cho sinh viên

```javascript
const studentData = {
  studentName: "Nguyễn Văn A",
  studentId: "STU001",
  institutionName: "Đại học ABC",
  institutionAddress: institutionAddress,
  dateOfBirth: 946684800,
  enrollmentDate: Math.floor(Date.now() / 1000),
  graduationDate: 0,
  gpa: 350, // 3.50
  major: "Computer Science",
  degreeType: "Bachelor",
  isActive: true,
  createdAt: 0,
  lastUpdated: 0
};

await factory.createLearnPass(studentAddress, studentData);
```

### 3. Phát hành chứng chỉ

```javascript
const certData = {
  certificateId: "CERT001",
  studentName: "Nguyễn Văn A",
  studentAddress: studentAddress,
  courseName: "Blockchain Fundamentals",
  courseId: "CS201",
  issuerName: "Đại học ABC",
  issuerAddress: institutionAddress,
  completionDate: Math.floor(Date.now() / 1000),
  issueDate: Math.floor(Date.now() / 1000),
  expiryDate: 0,
  grade: 900, // 90%
  creditHours: 3,
  certificateType: "Course Completion",
  skills: ["Blockchain", "Smart Contracts"],
  isVerified: false,
  verifiedBy: ethers.ZeroAddress,
  verifiedAt: 0,
  isRevoked: false,
  revokedBy: ethers.ZeroAddress,
  revokedAt: 0,
  revocationReason: ""
};

await factory.issueCertificate(studentAddress, certData);
```

### 4. Phân phối rewards

```javascript
await factory.distributeReward(
  studentAddress,
  ethers.parseEther("100"), // 100 EDU tokens
  "course_completion"
);
```

### 5. Mua sản phẩm trên marketplace

```javascript
// Approve EDU tokens
await eduToken.approve(marketplaceAddress, ethers.parseEther("100"));

// Purchase product
await marketplace.purchaseProduct(
  productId,
  1, // quantity
  "delivery_address" // for physical products
);
```

## Security Features

### Access Control
- Role-based permissions (Admin, Institution, Verifier, etc.)
- Multi-signature support cho critical operations
- Time-locked functions cho security

### Data Integrity
- Immutable records trên blockchain
- Cryptographic verification
- Audit trail cho tất cả operations

### Privacy
- Metadata stored off-chain
- IPFS integration cho large data
- Selective disclosure mechanisms

## Gas Optimization

### Best Practices
- Batch operations khi có thể
- Use events thay vì storage cho logging
- Optimize struct packing
- Use libraries cho common functions

### Estimated Gas Costs
- Mint LearnPass: ~150,000 gas
- Issue Certificate: ~200,000 gas
- Purchase Product: ~180,000 gas
- Distribute Reward: ~100,000 gas

## Testing

### Test Coverage
- Unit tests cho tất cả functions
- Integration tests cho workflows
- Gas optimization tests
- Security vulnerability tests

### Test Commands
```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/EduWallet.test.js

# Run tests with gas reporting
REPORT_GAS=true npm test

# Run tests with coverage
npx hardhat coverage
```

## Deployment

### Local Development
```bash
# Start local node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet Deployment
```bash
# Deploy to Pione Zero
npx hardhat run scripts/deploy.js --network pioneZero

# Deploy to Pione Chain
npx hardhat run scripts/deploy.js --network pioneChain

# Verify contracts
npx hardhat verify --network pioneZero <CONTRACT_ADDRESS>
npx hardhat verify --network pioneChain <CONTRACT_ADDRESS>
```

### Mainnet Deployment
```bash
# Deploy to Polygon
npx hardhat run scripts/deploy.js --network polygon

# Verify contracts
npx hardhat verify --network polygon <CONTRACT_ADDRESS>
```

## Monitoring và Maintenance

### Event Monitoring
- Track tất cả important events
- Set up alerts cho critical operations
- Monitor gas usage và costs

### Upgrade Strategy
- Use proxy patterns cho upgradeable contracts
- Implement migration scripts
- Maintain backward compatibility

### Backup và Recovery
- Regular backup của contract state
- Emergency pause mechanisms
- Recovery procedures

## Integration với Frontend

Xem file [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) để biết chi tiết về cách tích hợp với React frontend.

## API Reference

### Factory Contract

#### Functions
- `registerInstitution()` - Đăng ký institution mới
- `verifyInstitution()` - Xác thực institution
- `createLearnPass()` - Tạo LearnPass cho sinh viên
- `issueCertificate()` - Phát hành chứng chỉ
- `distributeReward()` - Phân phối rewards

#### Events
- `InstitutionRegistered` - Institution được đăng ký
- `LearnPassCreated` - LearnPass được tạo
- `CertificateIssued` - Chứng chỉ được phát hành
- `RewardDistributed` - Reward được phân phối

### Marketplace Contract

#### Functions
- `addProduct()` - Thêm sản phẩm mới
- `purchaseProduct()` - Mua sản phẩm
- `updatePurchaseStatus()` - Cập nhật trạng thái đơn hàng

#### Events
- `ProductAdded` - Sản phẩm được thêm
- `PurchaseMade` - Đơn hàng được tạo
- `PurchaseStatusUpdated` - Trạng thái đơn hàng được cập nhật

## Troubleshooting

### Common Issues

1. **"Insufficient funds"**
   - Check MATIC balance cho gas fees
   - Check EDU token balance cho transactions

2. **"Transaction failed"**
   - Increase gas limit
   - Check contract permissions
   - Verify network connection

3. **"Contract not found"**
   - Verify contract addresses
   - Check network configuration
   - Ensure contracts are deployed

### Debug Commands
```bash
# Check contract deployment
npx hardhat run scripts/check-deployment.js

# Verify contract state
npx hardhat run scripts/verify-state.js

# Test contract interactions
npx hardhat run scripts/test-interactions.js
```

## Contributing

### Development Workflow
1. Fork repository
2. Create feature branch
3. Write tests
4. Implement feature
5. Run tests
6. Submit pull request

### Code Standards
- Follow Solidity style guide
- Write comprehensive tests
- Document all functions
- Use proper error messages

## License

MIT License - xem file [LICENSE](./LICENSE) để biết chi tiết.

## Support

- **Documentation**: [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@eduwallet.com

## Changelog

### v1.0.0 (Current)
- Initial release
- Core contracts implementation
- Basic functionality
- Test coverage

### Roadmap
- v1.1.0: Advanced features
- v1.2.0: Cross-chain support
- v2.0.0: Major architecture updates

---

**EduWallet Smart Contracts** - Nền tảng blockchain cho giáo dục tương lai! 🎓✨
