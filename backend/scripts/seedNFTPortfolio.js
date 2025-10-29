/**
 * Seed NFT Portfolio Data (BlockchainTransaction with type='mint')
 * Run: node backend/scripts/seedNFTPortfolio.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const BlockchainTransaction = require('../src/models/BlockchainTransaction');
const User = require('../src/models/User');

// Sample NFT Portfolio data
const samplePortfolios = [
  {
    title: "Full Stack E-Commerce Platform",
    description: "A complete e-commerce solution built with MERN stack featuring real-time inventory, payment gateway integration, and advanced analytics dashboard.",
    skills: ["React", "Node.js", "MongoDB", "Express", "Redux"],
    technologies: ["JWT", "Stripe", "AWS S3", "Redis"],
    category: "web-development",
    ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    metadataURI: "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
  },
  {
    title: "AI-Powered Chatbot Platform",
    description: "Intelligent chatbot using natural language processing to provide customer support automation with sentiment analysis and multi-language support.",
    skills: ["Python", "TensorFlow", "NLP", "FastAPI", "Docker"],
    technologies: ["OpenAI GPT", "BERT", "PostgreSQL", "Redis"],
    category: "ai-ml",
    ipfsHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    metadataURI: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
  },
  {
    title: "Blockchain Supply Chain Tracker",
    description: "Decentralized supply chain management system using Ethereum smart contracts for transparent product tracking from manufacturer to consumer.",
    skills: ["Solidity", "Web3.js", "React", "Hardhat", "Ethers.js"],
    technologies: ["IPFS", "Ethereum", "MetaMask", "Chainlink"],
    category: "blockchain",
    ipfsHash: "QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB",
    metadataURI: "ipfs://QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB"
  },
  {
    title: "Mobile Fitness Tracking App",
    description: "Cross-platform mobile app for fitness tracking with workout plans, calorie counter, progress charts, and social sharing features.",
    skills: ["React Native", "TypeScript", "Firebase", "Redux"],
    technologies: ["Google Fit API", "HealthKit", "Push Notifications"],
    category: "mobile-development",
    ipfsHash: "QmU1234abcXYZ789defGHI456jklMNO123pqrSTU789vwx",
    metadataURI: "ipfs://QmU1234abcXYZ789defGHI456jklMNO123pqrSTU789vwx"
  },
  {
    title: "Data Visualization Dashboard",
    description: "Interactive data analytics dashboard with real-time charts, custom reports, and machine learning predictions for business intelligence.",
    skills: ["Python", "Pandas", "D3.js", "React", "Scikit-learn"],
    technologies: ["Plotly", "Apache Spark", "PostgreSQL", "Docker"],
    category: "data-science",
    ipfsHash: "QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ",
    metadataURI: "ipfs://QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ"
  },
  {
    title: "3D Game with Unity",
    description: "Multiplayer 3D action game with stunning graphics, physics engine, custom AI enemies, and real-time matchmaking system.",
    skills: ["Unity", "C#", "Blender", "Photon", "HLSL"],
    technologies: ["Unity ML-Agents", "PlayFab", "AWS GameLift"],
    category: "game-development",
    ipfsHash: "QmNLei78zWmzUdbeRB3CiUfAizWUrbeeZh5K1rhAQKCh51",
    metadataURI: "ipfs://QmNLei78zWmzUdbeRB3CiUfAizWUrbeeZh5K1rhAQKCh51"
  },
  {
    title: "Smart Home IoT System",
    description: "Complete IoT solution for smart home automation with voice control, energy monitoring, security cameras, and mobile app control.",
    skills: ["Arduino", "Raspberry Pi", "Python", "MQTT", "React"],
    technologies: ["AWS IoT", "TensorFlow Lite", "WebRTC", "Firebase"],
    category: "other",
    ipfsHash: "QmYHNYAaYK5hm74LSy7JqfothBGr7ZJgCqd9wT8X6oKGVq",
    metadataURI: "ipfs://QmYHNYAaYK5hm74LSy7JqfothBGr7ZJgCqd9wT8X6oKGVq"
  },
  {
    title: "Crypto Trading Bot",
    description: "Automated cryptocurrency trading bot with technical analysis, risk management, backtesting, and real-time market data integration.",
    skills: ["Python", "JavaScript", "Web3", "Machine Learning"],
    technologies: ["Binance API", "ccxt", "TA-Lib", "PostgreSQL"],
    category: "blockchain",
    ipfsHash: "QmRQtqAPz7eVYJzqwkxPqHJmWfXBYdCGKvYJvZcQVHJKLY",
    metadataURI: "ipfs://QmRQtqAPz7eVYJzqwkxPqHJmWfXBYdCGKvYJvZcQVHJKLY"
  },
  {
    title: "Social Media Analytics Tool",
    description: "Comprehensive social media analytics platform tracking engagement, sentiment, hashtag performance, and competitor analysis across multiple platforms.",
    skills: ["React", "Node.js", "Python", "GraphQL", "MongoDB"],
    technologies: ["Twitter API", "Instagram Graph", "Sentiment Analysis"],
    category: "web-development",
    ipfsHash: "QmTzQ1JRkWErjk39mryYw2WVaphAZNAREyMh6JEcGRmVj",
    metadataURI: "ipfs://QmTzQ1JRkWErjk39mryYw2WVaphAZNAREyMh6JEcGRmVj"
  },
  {
    title: "Online Learning Platform",
    description: "Educational platform with video courses, interactive quizzes, progress tracking, certificates, and live streaming capabilities.",
    skills: ["Vue.js", "Laravel", "MySQL", "WebRTC", "Redis"],
    technologies: ["FFmpeg", "AWS S3", "Stripe", "SendGrid"],
    category: "web-development",
    ipfsHash: "QmVHxRocoWgUChLEvfEyDuuD6qJ4PhdDL2dTLcpUy3dSC2",
    metadataURI: "ipfs://QmVHxRocoWgUChLEvfEyDuuD6qJ4PhdDL2dTLcpUy3dSC2"
  }
];

// Generate random Ethereum address
const generateAddress = () => {
  return '0x' + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

// Generate random transaction hash
const generateTxHash = () => {
  return '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

// Generate random block number
const generateBlockNumber = () => {
  return Math.floor(Math.random() * 1000000) + 15000000;
};

async function seedNFTPortfolio() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a user to associate with transactions (or use first user)
    let user = await User.findOne({ role: 'student' });
    
    if (!user) {
      console.log('⚠️  No student user found, creating demo user...');
      user = await User.create({
        username: 'demo_student',
        email: 'student@demo.com',
        password: 'Demo123456',
        firstName: 'Demo',
        lastName: 'Student',
        role: 'student',
        walletAddress: generateAddress(),
        isEmailVerified: true,
        isActive: true
      });
      console.log('✅ Demo user created');
    }

    console.log(`📝 Using user: ${user.email} (${user._id})`);

    // Clear existing mint transactions (optional)
    const deleteResult = await BlockchainTransaction.deleteMany({ type: 'mint' });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing mint transactions`);

    // Create NFT Portfolio transactions
    const transactions = [];
    
    for (let i = 0; i < samplePortfolios.length; i++) {
      const portfolio = samplePortfolios[i];
      const tokenId = i + 1;
      
      // Random date within last 6 months
      const randomDaysAgo = Math.floor(Math.random() * 180);
      const mintDate = new Date();
      mintDate.setDate(mintDate.getDate() - randomDaysAgo);

      const transaction = {
        userId: user._id,
        type: 'mint',
        tokenId: tokenId.toString(),
        txHash: generateTxHash(),
        blockNumber: generateBlockNumber(),
        from: '0x0000000000000000000000000000000000000000', // Zero address for minting
        to: user.walletAddress,
        ipfsHash: portfolio.ipfsHash,
        metadataURI: portfolio.metadataURI,
        status: 'success',
        gasUsed: Math.floor(Math.random() * 100000) + 50000,
        gasPrice: (Math.random() * 50 + 10).toFixed(2), // 10-60 Gwei
        metadata: {
          title: portfolio.title,
          description: portfolio.description,
          skills: portfolio.skills,
          technologies: portfolio.technologies,
          category: portfolio.category,
          image: `ipfs://${portfolio.ipfsHash}/preview.jpg`,
          attributes: [
            { trait_type: 'Category', value: portfolio.category },
            { trait_type: 'Skills Count', value: portfolio.skills.length },
            { trait_type: 'Tech Stack', value: portfolio.technologies.length },
            { trait_type: 'Mint Year', value: mintDate.getFullYear() }
          ]
        },
        createdAt: mintDate,
        updatedAt: mintDate
      };

      transactions.push(transaction);
    }

    // Insert all transactions
    const result = await BlockchainTransaction.insertMany(transactions);
    
    console.log('\n✅ Successfully created NFT Portfolio transactions!');
    console.log(`📊 Total transactions created: ${result.length}`);
    console.log('\n📋 Sample data:');
    
    result.slice(0, 3).forEach((tx, idx) => {
      console.log(`\n${idx + 1}. ${tx.metadata?.title || 'Untitled'}`);
      console.log(`   Token ID: ${tx.tokenId}`);
      console.log(`   TX Hash: ${tx.txHash}`);
      console.log(`   IPFS: ${tx.ipfsHash}`);
      console.log(`   Status: ${tx.status}`);
      console.log(`   Minted: ${tx.createdAt.toLocaleDateString()}`);
    });

    console.log(`\n... and ${result.length - 3} more transactions`);
    console.log('\n🎉 Seed completed successfully!');
    console.log('\n🌐 View in admin panel:');
    console.log('   http://localhost:3000/admin/nft-portfolio');
    
  } catch (error) {
    console.error('❌ Error seeding NFT Portfolio:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  seedNFTPortfolio()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = seedNFTPortfolio;
