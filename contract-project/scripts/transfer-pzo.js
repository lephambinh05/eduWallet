import hre from "hardhat";

const { ethers } = hre;

async function main() {
  console.log("💸 Starting PZO Token transfer...\n");

  // Địa chỉ PZO Token contract
  const pzoTokenAddress = "0x8DCdD7AdCa0005E505E0A78E8712fBb4f0AFC370";

  // Địa chỉ nhận (ví của bạn)
  const recipientAddress = "0x34ABc2b061f0d6c24c0786863Cbbd1dAdf7A1c89"; // Thay bằng địa chỉ ví của bạn

  // Số lượng PZO muốn transfer (ví dụ: 1000 PZO)
  const amount = ethers.parseEther("1000");

  // Get deployer signer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);

  // Connect to PZO Token contract
  const pzoToken = await ethers.getContractAt(
    "PZOToken",
    pzoTokenAddress,
    deployer
  );

  // Check deployer balance
  const deployerBalance = await pzoToken.balanceOf(deployer.address);
  console.log(
    "💰 Deployer PZO balance:",
    ethers.formatEther(deployerBalance),
    "PZO"
  );

  // Check recipient balance before
  const recipientBalanceBefore = await pzoToken.balanceOf(recipientAddress);
  console.log(
    "💰 Recipient balance before:",
    ethers.formatEther(recipientBalanceBefore),
    "PZO"
  );

  // Transfer PZO
  console.log(
    "\n🔄 Transferring",
    ethers.formatEther(amount),
    "PZO to",
    recipientAddress,
    "..."
  );
  const tx = await pzoToken.transfer(recipientAddress, amount);
  console.log("📝 Transaction hash:", tx.hash);

  // Wait for confirmation
  console.log("⏳ Waiting for confirmation...");
  await tx.wait();
  console.log("✅ Transfer confirmed!");

  // Check recipient balance after
  const recipientBalanceAfter = await pzoToken.balanceOf(recipientAddress);
  console.log(
    "\n💰 Recipient balance after:",
    ethers.formatEther(recipientBalanceAfter),
    "PZO"
  );

  console.log("\n🎉 Transfer completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
