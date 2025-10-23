import hre from "hardhat";

const { ethers } = hre;

async function main() {
  console.log("🧪 Testing Portfolio NFT Contract...\n");

  const portfolioNFTAddress = "0xA50a542B08CeEA9A0AAf89497288890d38aA0971";

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("👤 Testing with account:", signer.address);

  // Connect to contract
  const portfolioNFT = await ethers.getContractAt(
    "PortfolioNFT",
    portfolioNFTAddress,
    signer
  );

  // 1. Check contract info
  console.log("\n📊 Contract Information:");
  const name = await portfolioNFT.name();
  const symbol = await portfolioNFT.symbol();
  const totalSupply = await portfolioNFT.totalSupply();
  const owner = await portfolioNFT.owner();

  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Total Supply:", totalSupply.toString());
  console.log("   Owner:", owner);

  // 2. Mint test NFT
  console.log("\n🎨 Minting test Portfolio NFT...");

  const testData = {
    to: signer.address,
    studentName: "Lê Phạm Bình",
    studentId: "SV001",
    email: "lephambinh05@gmail.com",
    institution: "Đại học ABC",
    gpa: 375, // 3.75 GPA
    ipfsHash: "QmTestHash123456789",
    metadataURI: "ipfs://QmTestHash123456789/metadata.json",
  };

  console.log("   Student:", testData.studentName);
  console.log("   GPA:", testData.gpa / 100);
  console.log("   Institution:", testData.institution);

  const tx = await portfolioNFT.mintPortfolio(
    testData.to,
    testData.studentName,
    testData.studentId,
    testData.email,
    testData.institution,
    testData.gpa,
    testData.ipfsHash,
    testData.metadataURI
  );

  console.log("\n⏳ Waiting for transaction confirmation...");
  console.log("   Transaction hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed!");
  console.log("   Block number:", receipt.blockNumber);
  console.log("   Gas used:", receipt.gasUsed.toString());

  // 3. Get minted token info
  const newTotalSupply = await portfolioNFT.totalSupply();
  const tokenId = newTotalSupply - 1n;

  console.log("\n🎉 Portfolio NFT minted successfully!");
  console.log("   Token ID:", tokenId.toString());

  // 4. Get portfolio info
  console.log("\n📝 Portfolio Information:");
  const portfolioInfo = await portfolioNFT.getPortfolioInfo(tokenId);
  console.log("   Student Name:", portfolioInfo[0]);
  console.log("   Student ID:", portfolioInfo[1]);
  console.log("   Email:", portfolioInfo[2]);
  console.log("   Institution:", portfolioInfo[3]);
  console.log("   GPA:", portfolioInfo[4].toString() / 100);
  console.log(
    "   Mint Date:",
    new Date(Number(portfolioInfo[5]) * 1000).toLocaleString()
  );
  console.log("   IPFS Hash:", portfolioInfo[6]);
  console.log("   Verified:", portfolioInfo[7]);

  // 5. Check token URI
  const tokenURI = await portfolioNFT.tokenURI(tokenId);
  console.log("   Token URI:", tokenURI);

  // 6. Check owner tokens
  const ownerTokens = await portfolioNFT.getOwnerTokens(signer.address);
  console.log(
    "\n👤 Your Portfolio NFTs:",
    ownerTokens.map((t) => t.toString()).join(", ")
  );

  console.log("\n🔗 View on Explorer:");
  console.log("   https://zeroscan.org/address/" + portfolioNFTAddress);
  console.log("   https://zeroscan.org/tx/" + tx.hash);

  console.log("\n✅ Test completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
