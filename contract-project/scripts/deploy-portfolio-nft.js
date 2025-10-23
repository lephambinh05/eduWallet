import hre from "hardhat";

const { ethers } = hre;

async function main() {
  console.log("🚀 Starting Portfolio NFT deployment on Pione Zero...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying with account:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "PZO\n");

  // Deploy Portfolio NFT
  console.log("📚 Deploying Portfolio NFT contract...");
  const PortfolioNFT = await ethers.getContractFactory("PortfolioNFT");
  const portfolioNFT = await PortfolioNFT.deploy();
  await portfolioNFT.waitForDeployment();

  const portfolioNFTAddress = await portfolioNFT.getAddress();
  console.log("✅ Portfolio NFT deployed at:", portfolioNFTAddress);

  // Get contract info
  const name = await portfolioNFT.name();
  const symbol = await portfolioNFT.symbol();
  const totalSupply = await portfolioNFT.totalSupply();

  console.log("\n📊 Contract Information:");
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Total Supply:", totalSupply.toString());
  console.log("   Owner:", deployer.address);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n💡 Add to your .env file:");
  console.log("   REACT_APP_PORTFOLIO_NFT_ADDRESS=" + portfolioNFTAddress);

  console.log("\n🔗 View on Explorer:");
  console.log("   https://zeroscan.org/address/" + portfolioNFTAddress);

  console.log("\n📝 Next steps:");
  console.log("   1. Add contract address to frontend .env");
  console.log("   2. Update portfolioNFTService.js with new address");
  console.log("   3. Test minting Portfolio NFT from frontend");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
