import hre from "hardhat";

const { ethers } = hre;

async function main() {
  console.log("🪙 Starting PZO Token minting...\n");

  // Địa chỉ PZO Token contract
  const pzoTokenAddress = "0x8DCdD7AdCa0005E505E0A78E8712fBb4f0AFC370";

  // Địa chỉ nhận (ví của bạn) - THAY ĐỔI ĐỊA CHỈ NÀY
  const recipientAddress = "0xYOUR_WALLET_ADDRESS_HERE";

  // Số lượng PZO muốn mint (ví dụ: 10000 PZO)
  const amount = ethers.parseEther("10000");

  // Get deployer signer (chỉ owner mới mint được)
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer/Owner address:", deployer.address);

  // Connect to PZO Token contract
  const pzoToken = await ethers.getContractAt(
    "PZOToken",
    pzoTokenAddress,
    deployer
  );

  // Check recipient balance before
  const balanceBefore = await pzoToken.balanceOf(recipientAddress);
  console.log(
    "💰 Recipient balance before:",
    ethers.formatEther(balanceBefore),
    "PZO"
  );

  // Mint PZO
  console.log(
    "\n🪙 Minting",
    ethers.formatEther(amount),
    "PZO to",
    recipientAddress,
    "..."
  );
  const tx = await pzoToken.mint(recipientAddress, amount);
  console.log("📝 Transaction hash:", tx.hash);

  // Wait for confirmation
  console.log("⏳ Waiting for confirmation...");
  await tx.wait();
  console.log("✅ Mint confirmed!");

  // Check recipient balance after
  const balanceAfter = await pzoToken.balanceOf(recipientAddress);
  console.log(
    "\n💰 Recipient balance after:",
    ethers.formatEther(balanceAfter),
    "PZO"
  );

  // Check total supply
  const totalSupply = await pzoToken.totalSupply();
  console.log("📊 Total PZO supply:", ethers.formatEther(totalSupply), "PZO");

  console.log("\n🎉 Minting completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
