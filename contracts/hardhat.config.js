require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const EXPLORER_API_KEY = process.env.EXPLORER_API_KEY || '';

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ]
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    },
    pioneZero: {
      url: "https://rpc.zeroscan.org",
      chainId: 5080,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    pioneChain: {
      url: "https://rpc.pionescan.com",
      chainId: 5090,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    // Keep Polygon as backup option
    polygon: {
      url: "https://polygon-rpc.com/",
      chainId: 137,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gasPrice: 30000000000, // 30 gwei
    }
  },
  etherscan: {
    apiKey: {
      pioneZero: EXPLORER_API_KEY,
      pioneChain: EXPLORER_API_KEY,
      polygon: EXPLORER_API_KEY
    },
    customChains: [
      {
        network: "pioneZero",
        chainId: 5080,
        urls: {
          apiURL: "https://zeroscan.org/api/", 
          browserURL: "https://zeroscan.org/", 
        },
      },
      {
        network: "pioneChain",
        chainId: 5090,
        urls: {
          apiURL: "https://scan.pionechain.com/api/", 
          browserURL: "https://scan.pionechain.com/", 
        },
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
