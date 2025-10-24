// Test script to check environment variables
console.log("🔍 Checking environment variables...\n");

console.log("REACT_APP_BACKEND_URL:", process.env.REACT_APP_BACKEND_URL);
console.log(
  "REACT_APP_PIONE_ZERO_RPC_URL:",
  process.env.REACT_APP_PIONE_ZERO_RPC_URL
);
console.log(
  "REACT_APP_PZO_TOKEN_ADDRESS:",
  process.env.REACT_APP_PZO_TOKEN_ADDRESS
);
console.log(
  "REACT_APP_POINT_TOKEN_ADDRESS:",
  process.env.REACT_APP_POINT_TOKEN_ADDRESS
);

if (process.env.REACT_APP_PZO_TOKEN_ADDRESS) {
  console.log("\n✅ PZO Token address found!");
} else {
  console.log("\n❌ PZO Token address NOT found!");
  console.log("Make sure you:");
  console.log("1. Added the address to .env file");
  console.log("2. Restarted the React dev server (npm start)");
  console.log("3. The variable name starts with REACT_APP_");
}
