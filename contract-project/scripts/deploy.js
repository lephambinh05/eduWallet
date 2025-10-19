import hre from "hardhat";

const { ethers } = hre;

async function main() {
  console.log("🚀 Starting EduWallet deployment...");
  
  // Lấy contract factory
  const EduWalletDataStore = await ethers.getContractFactory("EduWalletDataStore");
  
  // Deploy contract
  console.log("📚 Deploying EduWalletDataStore contract...");
  const eduWallet = await EduWalletDataStore.deploy();
  
  // Chờ contract được deploy
  await eduWallet.waitForDeployment();
  
  // Lấy địa chỉ contract
  const contractAddress = await eduWallet.getAddress();
  
  console.log("✅ Deployed EduWallet contract at:", contractAddress);
  console.log("📋 Contract address:", contractAddress);
  console.log("🔗 Add this to your .env file: CONTRACT_ADDRESS=" + contractAddress);
  
  // Verify deployment
  const [recordCount, badgeCount, portfolioCount] = await eduWallet.getCounts();
  console.log("📊 Initial counts:");
  console.log("   - Learning Records:", recordCount.toString());
  console.log("   - Badges:", badgeCount.toString());
  console.log("   - Portfolios:", portfolioCount.toString());
  
  // Lấy owner address
  const owner = await eduWallet.owner();
  console.log("👤 Contract owner:", owner);
  
  console.log("🎉 Deployment completed successfully!");
  console.log("💡 You can now use this contract to:");
  console.log("   - Add learning records (as authorized issuer)");
  console.log("   - Award badges to students");
  console.log("   - Create portfolios");
  console.log("   - Manage authorized issuers");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
