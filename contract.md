Dưới đây cụ thể mà để giúp chung ta deploy hợp đồng trên Pione zerochain và lấy CONTRACT_ADDRESS
Những thứ cần chuẩn bị:
Trước tiên đưa 2 biến này vào env:
RPC_URL=https://rpc.zeroscan.org
PRIVATE_KEY= (các bạn lấy trong ví của các bạn)

Cài dependencies và build 
Code: 
npm install
npx hardhat compile

Tiếp theo đó các bạn sử cho mình file hardhat.config.js:
Đưa các đoạn cấu hình này vào: 
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    pzo: {
      url: "https://rpc.zeroscan.org",
      chainId: 5080,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
Tạo File hợp đồng .sol (các bạn tự code smart contract ở đây nhé!,Hardhat cần file này để biên dịch và biết cái gì cần deploy.)

File triển khai (scripts/deploy.js)
Đây sẽ là Là file hướng dẫn Hardhat cách deploy contract lên blockchain.
Đây là code tham khảo: 
import hre from "hardhat";

const { ethers } = hre;

async function main() {
  const SoilDataStore = await ethers.getContractFactory("SoilDataStore")//đây là tên file .sol của mình nhé, các bạn thay tên file hợp đồng của các bạn vào;
  const store = await SoilDataStore.deploy();
  await store.waitForDeployment();
  console.log("Deployed contract at:", await store.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

Deploy hợp đồng lên PZO:
npx hardhat run scripts/deploy.js --network pzo
Kết quả in ra: Deployed contract at: 0x…… 
Các bạn lấy address contract đó đưa vào :
CONTRACT_ADDRESS= các bạn vừa lấy rồi để trong env nhé.




đầu tiên mình xin được nhắc lại 1 chút về thư viện ethers và framework Hardhat 2 cái mà chúng ta sẽ sử dụng siêu nhiều khi lập trình blockchain:

Hardhat
Là một môi trường phát triển (development environment) dành cho smart contract Ethereum.

chức năng như:

Biên dịch (compile) code Solidity,
Triển khai (deploy) lên mạng blockchain,
Kiểm thử (test), debug, và tự động hóa các tác vụ phát triển hợp đồng thông minh.

tài liệu:
https://v2.hardhat.org/hardhat-runner/docs/getting-started

Ethers
Là thư viện JavaScript dùng để tương tác với blockchain Ethereum.

chức năng chính:
Gửi giao dịch (transaction),
Gọi hàm trong smart contract,
Lấy dữ liệu từ blockchain,
Kết nối với ví như MetaMask hoặc Pione zerochain.

Ethers hiểu đơn giản là “cầu nối” giữa ứng dụng web và blockchain Ethereum.

tài liệu: https://docs.ethers.org/v6/