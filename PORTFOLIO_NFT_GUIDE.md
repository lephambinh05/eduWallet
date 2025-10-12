# Portfolio NFT Implementation Guide

## 🎯 **Overview**

Portfolio NFT là một hệ thống cho phép sinh viên tạo ra các NFT bất biến từ portfolio học tập của họ, sử dụng hybrid approach kết hợp on-chain và off-chain storage.

## 🏗️ **Architecture**

### **Smart Contract Layer**
- **PortfolioNFT.sol**: Contract chính quản lý Portfolio NFT
- **Hybrid Storage**: Summary on-chain, detailed data off-chain (IPFS)
- **Digital Signatures**: Verification từ institutions
- **Versioning System**: Hỗ trợ update portfolio

### **IPFS Layer**
- **Portfolio Data**: Lưu trữ dữ liệu chi tiết
- **Metadata**: NFT metadata cho OpenSea compatibility
- **Images**: Preview images cho portfolio

### **Frontend Layer**
- **PortfolioMintingModal**: UI để mint NFT
- **PortfolioViewer**: UI để bên thứ 3 xem portfolio
- **PortfolioNFT Page**: Main interface

## 📋 **Features**

### ✅ **Completed Features**

1. **Smart Contract**
   - ✅ PortfolioNFT contract với hybrid approach
   - ✅ Digital signature verification
   - ✅ Versioning system
   - ✅ Institution authorization
   - ✅ Data integrity verification

2. **IPFS Service**
   - ✅ Upload portfolio data to IPFS
   - ✅ Upload metadata to IPFS
   - ✅ Upload preview images
   - ✅ Retrieve data from IPFS
   - ✅ Data hash calculation
   - ✅ Integrity verification

3. **Frontend Components**
   - ✅ PortfolioMintingModal
   - ✅ PortfolioViewer
   - ✅ PortfolioNFT page
   - ✅ Navigation integration

4. **Services**
   - ✅ PortfolioNFTService
   - ✅ IPFSService
   - ✅ Blockchain integration

## 🚀 **How to Use**

### **1. Mint Portfolio NFT**

```javascript
// 1. Connect wallet
const { account, isConnected } = useWallet();

// 2. Open minting modal
<PortfolioMintingModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={(result) => {
    console.log('NFT minted:', result.tokenId);
  }}
/>

// 3. Portfolio data will be automatically loaded from database
// 4. Upload preview image (optional)
// 5. Click "Mint Portfolio NFT"
```

### **2. View Portfolio NFT**

```javascript
// Search by Token ID
const portfolio = await portfolioNFTService.getCompletePortfolio(tokenId);

// Search by Owner Address
const tokenId = await portfolioNFTService.getPortfolioByOwner(ownerAddress);
const portfolio = await portfolioNFTService.getCompletePortfolio(tokenId);

// Direct IPFS lookup
const data = await ipfsService.getPortfolioData(ipfsHash);
```

### **3. Update Portfolio NFT**

```javascript
// Update existing portfolio
const result = await portfolioNFTService.updatePortfolio(
  tokenId,
  newPortfolioData,
  {
    version: currentVersion + 1,
    institution: institutionAddress,
    institutionSignature: signature
  }
);
```

## 🔧 **Configuration**

### **Environment Variables**

```bash
# IPFS Configuration
REACT_APP_PINATA_API_KEY=your_pinata_api_key
REACT_APP_PINATA_SECRET_KEY=your_pinata_secret_key

# Smart Contract
REACT_APP_PORTFOLIO_NFT_CONTRACT_ADDRESS=0x...

# Blockchain
REACT_APP_PIONE_ZERO_RPC_URL=https://pione-zero-chain.rpc.pione.tech
REACT_APP_PIONE_CHAIN_RPC_URL=https://pione-chain.rpc.pione.tech
```

### **Pinata Setup**

1. Tạo account tại [Pinata](https://pinata.cloud)
2. Lấy API Key và Secret Key
3. Thêm vào environment variables

## 📊 **Data Structure**

### **On-chain (Smart Contract)**
```solidity
struct PortfolioSummary {
    address owner;
    address institution;
    uint256 totalCourses;
    uint256 totalCertificates;
    uint256 totalBadges;
    uint256 gpa;
    string dataHash;
    string ipfsHash;
    bytes institutionSignature;
    uint256 version;
    uint256 lastUpdated;
    bool isVerified;
    bool exists;
}
```

### **Off-chain (IPFS)**
```json
{
  "version": 1,
  "timestamp": "2024-01-15T10:30:00Z",
  "owner": "0x1234...",
  "institution": "0x5678...",
  "user": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "studentId": "STU001"
  },
  "courses": [...],
  "certificates": [...],
  "badges": [...],
  "statistics": {...}
}
```

## 🔐 **Security Features**

### **1. Data Integrity**
- Keccak256 hash verification
- IPFS content addressing
- Blockchain immutability

### **2. Digital Signatures**
- Institution verification
- Cryptographic proof of authenticity
- Anti-tampering protection

### **3. Access Control**
- Owner-only updates
- Institution authorization
- Public read access

## 💰 **Cost Estimation**

### **Minting Costs**
- **Gas Fee**: ~50,000-100,000 gas (~$5-20)
- **IPFS Storage**: ~$0.01-0.1/tháng
- **Total**: ~$5-25 per NFT

### **Update Costs**
- **Gas Fee**: ~30,000-80,000 gas (~$3-15)
- **IPFS Storage**: ~$0.01-0.1/tháng
- **Total**: ~$3-20 per update

## 🔄 **Versioning System**

### **Version Management**
```javascript
// Current version
const currentVersion = portfolio.version;

// New version
const newVersion = currentVersion + 1;

// Update with versioning
await portfolioNFTService.updatePortfolio(tokenId, newData, {
  version: newVersion
});
```

### **Version History**
- Mỗi version được lưu trữ vĩnh viễn
- Không thể xóa hoặc sửa version cũ
- Có thể xem lịch sử thay đổi

## 🌐 **Third-party Verification**

### **Public Verification**
```javascript
// Anyone can verify portfolio
const portfolio = await portfolioNFTService.getCompletePortfolio(tokenId);

// Check verification status
const isVerified = await portfolioNFTService.isPortfolioVerified(tokenId);

// Verify data integrity
const isValid = ipfsService.verifyDataIntegrity(
  portfolio.detailedData, 
  portfolio.dataHash
);
```

### **Verification Process**
1. **Search**: Tìm portfolio bằng Token ID hoặc Owner Address
2. **Retrieve**: Lấy dữ liệu từ blockchain và IPFS
3. **Verify**: Kiểm tra hash và signature
4. **Display**: Hiển thị thông tin đã verify

## 🚀 **Deployment**

### **1. Deploy Smart Contracts**
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network pioneZero
```

### **2. Update Frontend**
```bash
# Update contract addresses in .env
REACT_APP_PORTFOLIO_NFT_CONTRACT_ADDRESS=0x...

# Start frontend
npm start
```

### **3. Test Integration**
```bash
# Test minting
# Test viewing
# Test verification
```

## 📈 **Future Enhancements**

### **Planned Features**
- [ ] Batch minting
- [ ] Portfolio templates
- [ ] Advanced analytics
- [ ] Social features
- [ ] Mobile app
- [ ] API for third-party integration

### **Potential Integrations**
- [ ] OpenSea marketplace
- [ ] University systems
- [ ] Job platforms
- [ ] Certification bodies
- [ ] Learning management systems

## 🐛 **Troubleshooting**

### **Common Issues**

1. **IPFS Upload Failed**
   - Check Pinata API keys
   - Verify network connection
   - Check file size limits

2. **Minting Failed**
   - Ensure wallet is connected
   - Check gas fees
   - Verify contract address

3. **Data Not Found**
   - Check IPFS hash
   - Verify network
   - Check contract deployment

### **Debug Commands**
```javascript
// Check contract deployment
const contract = new ethers.Contract(address, abi, provider);
const name = await contract.name();

// Check IPFS data
const data = await ipfsService.getPortfolioData(hash);

// Verify signature
const isValid = await contract.verifyInstitutionSignature(summary);
```

## 📞 **Support**

For issues or questions:
1. Check this documentation
2. Review error messages
3. Check browser console
4. Verify environment variables
5. Test with different networks

---

**Portfolio NFT System** - Transforming academic achievements into immutable blockchain records! 🎓✨
