import hre from "hardhat";

const { ethers } = hre;

async function main() {
  console.log("🚀 Starting PZO and Point Token deployment...");
  
  // Deploy PZO Token first
  console.log("📚 Deploying PZO Token...");
  const PZOToken = await ethers.getContractFactory("PZOToken");
  const pzoToken = await PZOToken.deploy();
  await pzoToken.waitForDeployment();
  const pzoTokenAddress = await pzoToken.getAddress();
  
  console.log("✅ PZO Token deployed at:", pzoTokenAddress);
  
  // Deploy Point Token with PZO Token address
  console.log("🎯 Deploying Point Token...");
  const PointToken = await ethers.getContractFactory("PointToken");
  const pointToken = await PointToken.deploy(pzoTokenAddress);
  await pointToken.waitForDeployment();
  const pointTokenAddress = await pointToken.getAddress();
  
  console.log("✅ Point Token deployed at:", pointTokenAddress);
  
  // Get deployer address
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);
  
  // Check balances
  const pzoBalance = await pzoToken.balanceOf(deployer.address);
  console.log("💰 PZO Balance:", ethers.formatEther(pzoBalance), "PZO");
  
  const pointBalance = await pointToken.balanceOf(deployer.address);
  console.log("🎯 Point Balance:", ethers.formatEther(pointBalance), "POINT");
  
  // Test exchange rate
  const exchangeInfo = await pointToken.getExchangeInfo();
  console.log("📊 Exchange Rate:", exchangeInfo.rate.toString());
  console.log("📊 PZO Decimals:", exchangeInfo.pzoDecimals.toString());
  console.log("📊 Point Decimals:", exchangeInfo.pointDecimals.toString());
  
  console.log("🎉 Token deployment completed successfully!");
  console.log("💡 Contract addresses:");
  console.log("   - PZO Token:", pzoTokenAddress);
  console.log("   - Point Token:", pointTokenAddress);
  console.log("🔗 Add these to your .env file:");
  console.log("   PZO_TOKEN_ADDRESS=" + pzoTokenAddress);
  console.log("   POINT_TOKEN_ADDRESS=" + pointTokenAddress);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});

