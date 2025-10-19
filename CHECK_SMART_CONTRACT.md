# 🔍 Cách kiểm tra Smart Contract đã tạo thành công

## 🎯 **Các cách kiểm tra:**

### **1. Kiểm tra trên Frontend (Dễ nhất)**

#### **Bước 1: Khởi động ứng dụng**
```bash
# Khởi động frontend
cd src
npm start

# Mở browser: http://localhost:3000
```

#### **Bước 2: Vào trang CreateNFT**
1. Đăng nhập vào ứng dụng
2. Vào trang **CreateNFT** (`/create-nft`)
3. Kết nối MetaMask
4. Thử tạo Portfolio NFT

#### **Bước 3: Kiểm tra kết quả**
```javascript
// Mở Developer Tools (F12)
// Xem Console tab

// Nếu thành công sẽ thấy:
✅ Portfolio Contract connected: 0x742d35Cc...
📝 Portfolio NFT transaction sent: 0x1234567890abcdef...
✅ Portfolio NFT transaction confirmed: {...}

// Nếu lỗi sẽ thấy:
❌ Portfolio Contract connection failed: ...
❌ Create Portfolio NFT failed: ...
```

### **2. Kiểm tra trên Blockchain Explorer**

#### **Bước 1: Lấy Contract Address**
```bash
# Kiểm tra file .env
cat .env | grep CONTRACT_ADDRESS

# Hoặc xem trong console khi deploy
# Deployed contract at: 0x1234567890abcdef...
```

#### **Bước 2: Kiểm tra trên Explorer**
1. Mở browser: https://zeroscan.org
2. Tìm kiếm contract address: `0x1234567890abcdef...`
3. Xem thông tin contract:
   - ✅ **Contract được deploy**
   - ✅ **Có transactions**
   - ✅ **Có events** (PortfolioCreated)

### **3. Kiểm tra qua API Backend**

#### **Bước 1: Khởi động Backend**
```bash
cd backend
npm start
```

#### **Bước 2: Test API**
```bash
# Kiểm tra contract info
curl http://localhost:3001/api/eduwallet/contract-info

# Kết quả mong đợi:
{
  "success": true,
  "data": {
    "contractAddress": "0x1234567890abcdef...",
    "network": "pioneZero",
    "chainId": "5080",
    "counts": {
      "records": "0",
      "badges": "0", 
      "portfolios": "0"
    }
  }
}
```

### **4. Kiểm tra trực tiếp với Smart Contract**

#### **Tạo script test:**
```javascript
// test-contract.js
const { ethers } = require('ethers');

async function testContract() {
  // Kết nối với network
  const provider = new ethers.providers.JsonRpcProvider('https://rpc.zeroscan.org');
  
  // Contract ABI (simplified)
  const abi = [
    "function portfolioCount() external view returns (uint256)",
    "function getPortfolio(uint256 _id) external view returns (uint256 id, string memory title, string memory description, string memory projectHash, string[] memory skills, uint256 createdDate, address owner)"
  ];
  
  // Contract address
  const contractAddress = '0x1234567890abcdef...'; // Thay bằng address thực
  
  // Tạo contract instance
  const contract = new ethers.Contract(contractAddress, abi, provider);
  
  try {
    // Test 1: Lấy số lượng portfolio
    const count = await contract.portfolioCount();
    console.log('✅ Portfolio count:', count.toString());
    
    // Test 2: Lấy portfolio đầu tiên (nếu có)
    if (count.gt(0)) {
      const portfolio = await contract.getPortfolio(1);
      console.log('✅ First portfolio:', portfolio);
    }
    
    console.log('🎉 Smart contract hoạt động bình thường!');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

testContract();
```

#### **Chạy test:**
```bash
node test-contract.js
```

## 🎯 **Checklist kiểm tra:**

### **✅ Smart Contract đã sẵn sàng nếu:**

- [ ] **Frontend compile thành công** (không có lỗi)
- [ ] **MetaMask kết nối được** với contract
- [ ] **Console không có lỗi** khi tạo NFT
- [ ] **Transaction được gửi** (có txHash)
- [ ] **Contract address tồn tại** trên blockchain explorer
- [ ] **API backend trả về** contract info
- [ ] **Events được emit** (PortfolioCreated)

### **❌ Cần sửa nếu:**

- [ ] **Frontend báo lỗi** khi compile
- [ ] **MetaMask không kết nối được**
- [ ] **Console có lỗi** connection
- [ ] **Transaction bị reject**
- [ ] **Contract address không tồn tại**
- [ ] **API trả về lỗi**

## 🚀 **Test nhanh:**

### **1. Test Frontend:**
```bash
# Vào trang CreateNFT
# Kết nối MetaMask
# Điền form Portfolio
# Click "Tạo Portfolio NFT"
# Xem console (F12)
```

### **2. Test Backend:**
```bash
curl http://localhost:3001/api/eduwallet/contract-info
```

### **3. Test Blockchain:**
```bash
# Mở https://zeroscan.org
# Tìm contract address
# Xem transactions và events
```

## 🎉 **Kết quả mong đợi:**

Nếu tất cả đều ✅, nghĩa là:
- ✅ Smart contract đã deploy thành công
- ✅ Frontend kết nối được với contract
- ✅ Backend tích hợp hoàn chỉnh
- ✅ Có thể tạo Portfolio NFT
- ✅ Dữ liệu được lưu trên blockchain

**Hệ thống đã sẵn sàng sử dụng!** 🚀
