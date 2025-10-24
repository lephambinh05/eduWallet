// Script để kiểm tra PZO token trên Pione Zero
import { ethers } from "ethers";

async function checkPZOToken() {
  console.log("🔍 Checking PZO token on Pione Zero network...\n");

  // Connect to Pione Zero (ethers v5 syntax)
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.zeroscan.org"
  );

  // Địa chỉ ví của bạn
  const walletAddress = "0x34ABc2b061f0d6c24c0786863Cbbd1dAdf7A1c89"; // Thay bằng địa chỉ của bạn

  try {
    // 1. Kiểm tra native balance
    console.log("💰 Checking native balance...");
    const nativeBalance = await provider.getBalance(walletAddress);
    const nativeBalanceFormatted = ethers.utils.formatEther(nativeBalance);
    console.log(`Native PZO balance: ${nativeBalanceFormatted} PZO\n`);

    // 2. Kiểm tra network info
    console.log("🌐 Network information:");
    const network = await provider.getNetwork();
    console.log("Chain ID:", network.chainId.toString());
    console.log("Network name:", network.name);

    // 3. Thử một số địa chỉ contract PZO phổ biến
    const possibleAddresses = [
      "0x0000000000000000000000000000000000000000", // Zero address
      "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native token placeholder
      // Thêm các địa chỉ khác nếu biết
    ];

    console.log("\n🔍 Checking possible PZO token contracts...");

    const erc20ABI = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address) view returns (uint256)",
    ];

    for (const address of possibleAddresses) {
      try {
        const contract = new ethers.Contract(address, erc20ABI, provider);
        const name = await contract.name();
        const symbol = await contract.symbol();
        console.log(`✅ Found token at ${address}:`);
        console.log(`   Name: ${name}`);
        console.log(`   Symbol: ${symbol}`);
      } catch (error) {
        console.log(`❌ No valid token at ${address}`);
      }
    }

    console.log("\n📝 Recommendation:");
    console.log("PZO appears to be a NATIVE token (like ETH on Ethereum)");
    console.log("Use provider.getBalance() to get PZO balance");
    console.log("No ERC20 contract address needed for native PZO");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkPZOToken();
