# 🎯 Tạo Smart Contract và Thao tác từ Frontend

## 🚀 **Bước 1: Tạo Smart Contract**

### **1.1 Tạo project Hardhat**
```bash
# Tạo thư mục mới
mkdir my-eduwallet-contract
cd my-eduwallet-contract

# Khởi tạo npm project
npm init -y

# Cài đặt Hardhat
npm install --save-dev hardhat
npx hardhat init

# Chọn: Create a JavaScript project
```

### **1.2 Cài đặt dependencies**
```bash
# Cài đặt ethers và OpenZeppelin
npm install @openzeppelin/contracts
npm install dotenv
```

### **1.3 Tạo file .env**
```bash
# Tạo file .env
touch .env

# Nội dung .env:
RPC_URL=https://rpc.zeroscan.org
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=
```

### **1.4 Tạo Smart Contract**
```solidity
// contracts/EduWallet.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EduWallet {
    // Struct cho học bạ
    struct LearningRecord {
        uint256 id;
        string studentName;
        string courseName;
        uint256 score;
        address student;
        address issuer;
        uint256 timestamp;
        bool verified;
    }
    
    // Struct cho badge
    struct Badge {
        uint256 id;
        string name;
        string description;
        string imageHash;
        address student;
        uint256 earnedDate;
        bool active;
    }
    
    // Mappings
    mapping(uint256 => LearningRecord) public learningRecords;
    mapping(uint256 => Badge) public badges;
    mapping(address => uint256[]) public studentRecords;
    mapping(address => uint256[]) public studentBadges;
    
    // Counters
    uint256 public recordCount;
    uint256 public badgeCount;
    
    // Owner
    address public owner;
    
    // Events
    event LearningRecordAdded(uint256 indexed id, string studentName, address indexed student);
    event BadgeEarned(uint256 indexed id, string name, address indexed student);
    
    constructor() {
        owner = msg.sender;
    }
    
    // Thêm học bạ
    function addLearningRecord(
        string memory _studentName,
        string memory _courseName,
        uint256 _score,
        address _student
    ) public {
        recordCount++;
        
        learningRecords[recordCount] = LearningRecord({
            id: recordCount,
            studentName: _studentName,
            courseName: _courseName,
            score: _score,
            student: _student,
            issuer: msg.sender,
            timestamp: block.timestamp,
            verified: true
        });
        
        studentRecords[_student].push(recordCount);
        
        emit LearningRecordAdded(recordCount, _studentName, _student);
    }
    
    // Tạo badge
    function earnBadge(
        string memory _name,
        string memory _description,
        string memory _imageHash,
        address _student
    ) public {
        badgeCount++;
        
        badges[badgeCount] = Badge({
            id: badgeCount,
            name: _name,
            description: _description,
            imageHash: _imageHash,
            student: _student,
            earnedDate: block.timestamp,
            active: true
        });
        
        studentBadges[_student].push(badgeCount);
        
        emit BadgeEarned(badgeCount, _name, _student);
    }
    
    // Lấy học bạ
    function getLearningRecord(uint256 _id) public view returns (
        uint256 id,
        string memory studentName,
        string memory courseName,
        uint256 score,
        address student,
        address issuer,
        uint256 timestamp,
        bool verified
    ) {
        LearningRecord memory record = learningRecords[_id];
        return (
            record.id,
            record.studentName,
            record.courseName,
            record.score,
            record.student,
            record.issuer,
            record.timestamp,
            record.verified
        );
    }
    
    // Lấy badge
    function getBadge(uint256 _id) public view returns (
        uint256 id,
        string memory name,
        string memory description,
        string memory imageHash,
        address student,
        uint256 earnedDate,
        bool active
    ) {
        Badge memory badge = badges[_id];
        return (
            badge.id,
            badge.name,
            badge.description,
            badge.imageHash,
            badge.student,
            badge.earnedDate,
            badge.active
        );
    }
    
    // Lấy học bạ của sinh viên
    function getStudentRecords(address _student) public view returns (uint256[] memory) {
        return studentRecords[_student];
    }
    
    // Lấy badge của sinh viên
    function getStudentBadges(address _student) public view returns (uint256[] memory) {
        return studentBadges[_student];
    }
}
```

### **1.5 Tạo script deploy**
```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying EduWallet contract...");
  
  const EduWallet = await hre.ethers.getContractFactory("EduWallet");
  const eduWallet = await EduWallet.deploy();
  
  await eduWallet.waitForDeployment();
  
  const contractAddress = await eduWallet.getAddress();
  
  console.log("✅ Contract deployed to:", contractAddress);
  console.log("📋 Add this to your .env: CONTRACT_ADDRESS=" + contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### **1.6 Deploy contract**
```bash
# Compile
npx hardhat compile

# Deploy
npx hardhat run scripts/deploy.js --network pzo
```

## 🎨 **Bước 2: Tích hợp vào Frontend**

### **2.1 Cài đặt dependencies cho frontend**
```bash
# Vào thư mục frontend
cd src

# Cài đặt ethers
npm install ethers
```

### **2.2 Tạo service để tương tác với contract**
```javascript
// src/services/contractService.js
import { ethers } from 'ethers';

class ContractService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    this.contractABI = [
      // Learning Records
      "function addLearningRecord(string memory _studentName, string memory _courseName, uint256 _score, address _student) public",
      "function getLearningRecord(uint256 _id) public view returns (uint256 id, string memory studentName, string memory courseName, uint256 score, address student, address issuer, uint256 timestamp, bool verified)",
      "function getStudentRecords(address _student) public view returns (uint256[] memory)",
      
      // Badges
      "function earnBadge(string memory _name, string memory _description, string memory _imageHash, address _student) public",
      "function getBadge(uint256 _id) public view returns (uint256 id, string memory name, string memory description, string memory imageHash, address student, uint256 earnedDate, bool active)",
      "function getStudentBadges(address _student) public view returns (uint256[] memory)",
      
      // Counts
      "function recordCount() public view returns (uint256)",
      "function badgeCount() public view returns (uint256)",
      
      // Events
      "event LearningRecordAdded(uint256 indexed id, string studentName, address indexed student)",
      "event BadgeEarned(uint256 indexed id, string name, address indexed student)"
    ];
  }

  // Kết nối với MetaMask
  async connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Yêu cầu kết nối
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Tạo provider và signer
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        
        // Tạo contract instance
        this.contract = new ethers.Contract(
          this.contractAddress,
          this.contractABI,
          this.signer
        );
        
        console.log('✅ Wallet connected:', await this.signer.getAddress());
        return true;
      } catch (error) {
        console.error('❌ Wallet connection failed:', error);
        return false;
      }
    } else {
      console.error('❌ MetaMask not installed');
      return false;
    }
  }

  // Thêm học bạ
  async addLearningRecord(studentName, courseName, score, studentAddress) {
    try {
      const tx = await this.contract.addLearningRecord(
        studentName,
        courseName,
        score,
        studentAddress
      );
      
      console.log('📝 Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt);
      
      return {
        success: true,
        txHash: tx.hash,
        receipt: receipt
      };
    } catch (error) {
      console.error('❌ Add learning record failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Tạo badge
  async earnBadge(name, description, imageHash, studentAddress) {
    try {
      const tx = await this.contract.earnBadge(
        name,
        description,
        imageHash,
        studentAddress
      );
      
      console.log('🏆 Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt);
      
      return {
        success: true,
        txHash: tx.hash,
        receipt: receipt
      };
    } catch (error) {
      console.error('❌ Earn badge failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Lấy học bạ
  async getLearningRecord(recordId) {
    try {
      const record = await this.contract.getLearningRecord(recordId);
      
      return {
        success: true,
        data: {
          id: record.id.toString(),
          studentName: record.studentName,
          courseName: record.courseName,
          score: record.score.toString(),
          student: record.student,
          issuer: record.issuer,
          timestamp: new Date(parseInt(record.timestamp.toString()) * 1000),
          verified: record.verified
        }
      };
    } catch (error) {
      console.error('❌ Get learning record failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Lấy badge
  async getBadge(badgeId) {
    try {
      const badge = await this.contract.getBadge(badgeId);
      
      return {
        success: true,
        data: {
          id: badge.id.toString(),
          name: badge.name,
          description: badge.description,
          imageHash: badge.imageHash,
          student: badge.student,
          earnedDate: new Date(parseInt(badge.earnedDate.toString()) * 1000),
          active: badge.active
        }
      };
    } catch (error) {
      console.error('❌ Get badge failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Lấy học bạ của sinh viên
  async getStudentRecords(studentAddress) {
    try {
      const recordIds = await this.contract.getStudentRecords(studentAddress);
      
      const records = [];
      for (const id of recordIds) {
        const record = await this.getLearningRecord(id);
        if (record.success) {
          records.push(record.data);
        }
      }
      
      return {
        success: true,
        data: records
      };
    } catch (error) {
      console.error('❌ Get student records failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Lấy badge của sinh viên
  async getStudentBadges(studentAddress) {
    try {
      const badgeIds = await this.contract.getStudentBadges(studentAddress);
      
      const badges = [];
      for (const id of badgeIds) {
        const badge = await this.getBadge(id);
        if (badge.success) {
          badges.push(badge.data);
        }
      }
      
      return {
        success: true,
        data: badges
      };
    } catch (error) {
      console.error('❌ Get student badges failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Lấy địa chỉ ví hiện tại
  async getCurrentAddress() {
    if (this.signer) {
      return await this.signer.getAddress();
    }
    return null;
  }
}

export default new ContractService();
```

### **2.3 Tạo component để thao tác**
```javascript
// src/components/ContractInteraction.js
import React, { useState, useEffect } from 'react';
import contractService from '../services/contractService';

const ContractInteraction = () => {
  const [connected, setConnected] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [badges, setBadges] = useState([]);

  // Form states
  const [studentName, setStudentName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [score, setScore] = useState('');
  const [badgeName, setBadgeName] = useState('');
  const [badgeDescription, setBadgeDescription] = useState('');

  // Kết nối ví
  const connectWallet = async () => {
    setLoading(true);
    const success = await contractService.connectWallet();
    if (success) {
      setConnected(true);
      const address = await contractService.getCurrentAddress();
      setCurrentAddress(address);
      await loadData();
    }
    setLoading(false);
  };

  // Load dữ liệu
  const loadData = async () => {
    if (currentAddress) {
      const recordsResult = await contractService.getStudentRecords(currentAddress);
      const badgesResult = await contractService.getStudentBadges(currentAddress);
      
      if (recordsResult.success) {
        setRecords(recordsResult.data);
      }
      if (badgesResult.success) {
        setBadges(badgesResult.data);
      }
    }
  };

  // Thêm học bạ
  const addLearningRecord = async () => {
    if (!studentName || !courseName || !score) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    const result = await contractService.addLearningRecord(
      studentName,
      courseName,
      parseInt(score),
      currentAddress
    );

    if (result.success) {
      alert('✅ Thêm học bạ thành công!');
      setStudentName('');
      setCourseName('');
      setScore('');
      await loadData();
    } else {
      alert('❌ Lỗi: ' + result.error);
    }
    setLoading(false);
  };

  // Tạo badge
  const earnBadge = async () => {
    if (!badgeName || !badgeDescription) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    const result = await contractService.earnBadge(
      badgeName,
      badgeDescription,
      '0x123...', // Image hash
      currentAddress
    );

    if (result.success) {
      alert('✅ Tạo badge thành công!');
      setBadgeName('');
      setBadgeDescription('');
      await loadData();
    } else {
      alert('❌ Lỗi: ' + result.error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🎓 EduWallet Smart Contract</h1>
      
      {!connected ? (
        <div>
          <p>Kết nối ví để bắt đầu:</p>
          <button 
            onClick={connectWallet}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Đang kết nối...' : 'Kết nối MetaMask'}
          </button>
        </div>
      ) : (
        <div>
          <p>✅ Đã kết nối: {currentAddress}</p>
          
          {/* Form thêm học bạ */}
          <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h3>📝 Thêm học bạ</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Tên sinh viên"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <input
                type="text"
                placeholder="Tên khóa học"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <input
                type="number"
                placeholder="Điểm số"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <button
                onClick={addLearningRecord}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Đang xử lý...' : 'Thêm học bạ'}
              </button>
            </div>
          </div>

          {/* Form tạo badge */}
          <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h3>🏆 Tạo badge</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Tên badge"
                value={badgeName}
                onChange={(e) => setBadgeName(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <input
                type="text"
                placeholder="Mô tả badge"
                value={badgeDescription}
                onChange={(e) => setBadgeDescription(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <button
                onClick={earnBadge}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ffc107',
                  color: 'black',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Đang xử lý...' : 'Tạo badge'}
              </button>
            </div>
          </div>

          {/* Hiển thị dữ liệu */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <h3>📚 Học bạ ({records.length})</h3>
              {records.map((record, index) => (
                <div key={index} style={{ padding: '10px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '5px' }}>
                  <p><strong>{record.studentName}</strong></p>
                  <p>Khóa học: {record.courseName}</p>
                  <p>Điểm: {record.score}</p>
                  <p>Ngày: {record.timestamp.toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            
            <div style={{ flex: 1 }}>
              <h3>🏆 Badge ({badges.length})</h3>
              {badges.map((badge, index) => (
                <div key={index} style={{ padding: '10px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '5px' }}>
                  <p><strong>{badge.name}</strong></p>
                  <p>{badge.description}</p>
                  <p>Ngày nhận: {badge.earnedDate.toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractInteraction;
```

### **2.4 Thêm vào App.js**
```javascript
// src/App.js
import ContractInteraction from './components/ContractInteraction';

// Thêm route mới
<Route path="/contract" element={<ContractInteraction />} />
```

### **2.5 Tạo file .env cho frontend**
```bash
# .env
REACT_APP_CONTRACT_ADDRESS=0x1234567890abcdef...
```

## 🎯 **Cách sử dụng:**

1. **Deploy contract** với script trên
2. **Copy contract address** vào .env
3. **Khởi động frontend** với component mới
4. **Kết nối MetaMask** và bắt đầu thao tác
5. **Thêm học bạ, tạo badge** trực tiếp từ frontend

## 🎉 **Kết quả:**

- ✅ Smart contract đơn giản, dễ hiểu
- ✅ Frontend có thể tương tác trực tiếp
- ✅ Dữ liệu được lưu trên blockchain
- ✅ Có thể verify từ bất kỳ đâu
- ✅ Giao diện thân thiện, dễ sử dụng

**Bây giờ bạn có thể tạo và thao tác smart contract từ frontend!** 🚀
