const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting EduWallet contracts deployment...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // Base URI for NFT metadata
  const baseTokenURI = "https://api.eduwallet.com/metadata/";

  try {
    // 1. Deploy EDU Token
    console.log("1️⃣ Deploying EDU Token...");
    const EDUToken = await ethers.getContractFactory("EDUToken");
    const eduToken = await EDUToken.deploy(deployer.address);
    await eduToken.waitForDeployment();
    const eduTokenAddress = await eduToken.getAddress();
    console.log("✅ EDU Token deployed to:", eduTokenAddress);

    // 2. Deploy LearnPass NFT
    console.log("\n2️⃣ Deploying LearnPass NFT...");
    const LearnPassNFT = await ethers.getContractFactory("LearnPassNFT");
    const learnPassNFT = await LearnPassNFT.deploy(deployer.address, baseTokenURI + "learnpass/");
    await learnPassNFT.waitForDeployment();
    const learnPassNFTAddress = await learnPassNFT.getAddress();
    console.log("✅ LearnPass NFT deployed to:", learnPassNFTAddress);

    // 3. Deploy Certificate NFT
    console.log("\n3️⃣ Deploying Certificate NFT...");
    const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
    const certificateNFT = await CertificateNFT.deploy(deployer.address, baseTokenURI + "certificate/");
    await certificateNFT.waitForDeployment();
    const certificateNFTAddress = await certificateNFT.getAddress();
    console.log("✅ Certificate NFT deployed to:", certificateNFTAddress);

    // 4. Deploy EduWallet Factory
    console.log("\n4️⃣ Deploying EduWallet Factory...");
    const EduWalletFactory = await ethers.getContractFactory("EduWalletFactory");
    const factory = await EduWalletFactory.deploy(deployer.address);
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("✅ EduWallet Factory deployed to:", factoryAddress);

    // 5. Deploy Marketplace
    console.log("\n5️⃣ Deploying Marketplace...");
    const EduWalletMarketplace = await ethers.getContractFactory("EduWalletMarketplace");
    const marketplace = await EduWalletMarketplace.deploy(deployer.address, eduTokenAddress, factoryAddress);
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log("✅ Marketplace deployed to:", marketplaceAddress);

    // 6. Initialize Factory with contract addresses
    console.log("\n6️⃣ Initializing Factory...");
    await factory.initializeContracts(eduTokenAddress, learnPassNFTAddress, certificateNFTAddress);
    console.log("✅ Factory initialized with contract addresses");

    // 7. Set marketplace address in factory
    console.log("\n7️⃣ Setting marketplace address in Factory...");
    await factory.setMarketplace(marketplaceAddress);
    console.log("✅ Marketplace address set in Factory");

    // 8. Deploy Portfolio NFT
    console.log("\n8️⃣ Deploying Portfolio NFT...");
    const PortfolioNFT = await ethers.getContractFactory("PortfolioNFT");
    const portfolioNFT = await PortfolioNFT.deploy(deployer.address);
    await portfolioNFT.waitForDeployment();
    const portfolioNFTAddress = await portfolioNFT.getAddress();
    console.log("✅ Portfolio NFT deployed to:", portfolioNFTAddress);

    // 8. Grant necessary roles
    console.log("\n8️⃣ Setting up roles and permissions...");
    
    // Grant factory minter role for EDU Token
    await eduToken.grantRole(await eduToken.MINTER_ROLE(), factoryAddress);
    console.log("✅ Factory granted MINTER_ROLE for EDU Token");

    // Grant factory minter and updater roles for LearnPass NFT
    await learnPassNFT.grantRole(await learnPassNFT.MINTER_ROLE(), factoryAddress);
    await learnPassNFT.grantRole(await learnPassNFT.UPDATER_ROLE(), factoryAddress);
    console.log("✅ Factory granted MINTER_ROLE and UPDATER_ROLE for LearnPass NFT");

    // Grant factory issuer and verifier roles for Certificate NFT
    await certificateNFT.grantRole(await certificateNFT.ISSUER_ROLE(), factoryAddress);
    await certificateNFT.grantRole(await certificateNFT.VERIFIER_ROLE(), factoryAddress);
    console.log("✅ Factory granted ISSUER_ROLE and VERIFIER_ROLE for Certificate NFT");

    // Grant marketplace merchant role to factory (for demo purposes)
    await marketplace.grantRole(await marketplace.MERCHANT_ROLE(), factoryAddress);
    console.log("✅ Factory granted MERCHANT_ROLE for Marketplace");

    console.log("\n🎉 All contracts deployed successfully!\n");

  // Display deployment summary
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("====================");
  const network = await deployer.provider.getNetwork();
  console.log("Network:", network.name || `Chain ID: ${network.chainId}`);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("EDU Token:", eduTokenAddress);
  console.log("LearnPass NFT:", learnPassNFTAddress);
  console.log("Certificate NFT:", certificateNFTAddress);
  console.log("Factory:", factoryAddress);
  console.log("Marketplace:", marketplaceAddress);
  console.log("Portfolio NFT:", portfolioNFTAddress);
  console.log("Base URI:", baseTokenURI);

    // Save deployment info to file
    const deploymentInfo = {
      network: network.name || `Chain ID: ${network.chainId}`,
      chainId: network.chainId.toString(),
      deployer: deployer.address,
      contracts: {
        eduToken: eduTokenAddress,
        learnPassNFT: learnPassNFTAddress,
        certificateNFT: certificateNFTAddress,
        factory: factoryAddress,
        marketplace: marketplaceAddress,
        portfolioNFT: portfolioNFTAddress
      },
      baseTokenURI: baseTokenURI,
      deploymentTime: new Date().toISOString()
    };

    const fs = require('fs');
    const path = require('path');
    const deploymentPath = path.join(__dirname, '..', 'deployments');
    
    // Create deployments directory if it doesn't exist
    if (!fs.existsSync(deploymentPath)) {
      fs.mkdirSync(deploymentPath, { recursive: true });
    }

    // Save deployment info
    const networkName = network.name || `chain-${network.chainId}`;
    const deploymentFile = path.join(deploymentPath, `${networkName}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

    // Display next steps
    console.log("\n🔧 NEXT STEPS");
    console.log("=============");
    console.log("1. Verify contracts on block explorer (if on testnet/mainnet)");
    console.log("2. Update frontend with contract addresses");
    console.log("3. Register educational institutions");
    console.log("4. Test the system with sample data");
    console.log("5. Deploy to production network when ready");

    console.log("\n✨ Deployment completed successfully!");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment script failed:", error);
    process.exit(1);
  });
