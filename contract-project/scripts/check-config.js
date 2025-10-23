require("dotenv").config();

console.log("🔍 Checking configuration...\n");

// Check PRIVATE_KEY
if (!process.env.PRIVATE_KEY) {
  console.log("❌ PRIVATE_KEY not found in .env file!");
  console.log(
    "📝 Please add your MetaMask private key to contract-project/.env"
  );
  console.log("   Example: PRIVATE_KEY=your_private_key_without_0x\n");
  process.exit(1);
}

if (process.env.PRIVATE_KEY.startsWith("0x")) {
  console.log("⚠️  WARNING: Private key should NOT start with '0x'");
  console.log("   Please remove '0x' from the beginning of your private key\n");
  process.exit(1);
}

console.log(
  "✅ PRIVATE_KEY found (length:",
  process.env.PRIVATE_KEY.length,
  "characters)"
);

if (process.env.PRIVATE_KEY.length !== 64) {
  console.log("⚠️  WARNING: Private key should be 64 characters long");
  console.log("   Current length:", process.env.PRIVATE_KEY.length);
  console.log("   Please check your private key\n");
}

// Check RPC_URL
const rpcUrl = process.env.RPC_URL || "https://rpc.zeroscan.org";
console.log("✅ RPC_URL:", rpcUrl);

console.log("\n🎉 Configuration looks good!");
console.log("\n📝 Next step: Run deployment command");
console.log("   npx hardhat run scripts/deploy-tokens.js --network pzo\n");
