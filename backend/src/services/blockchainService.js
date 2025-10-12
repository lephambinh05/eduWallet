const { ethers } = require('ethers');
const logger = require('../utils/logger');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contracts = {};
    this.initializeProvider();
  }

  /**
   * Initialize blockchain provider and wallet
   */
  initializeProvider() {
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
      
      // Initialize wallet if private key is provided
      if (process.env.BLOCKCHAIN_PRIVATE_KEY) {
        this.wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, this.provider);
        logger.info('Blockchain wallet initialized', { address: this.wallet.address });
      }

      // Initialize contracts
      this.initializeContracts();
      
      logger.info('Blockchain service initialized', {
        network: process.env.BLOCKCHAIN_NETWORK,
        rpcUrl: process.env.BLOCKCHAIN_RPC_URL,
        chainId: process.env.BLOCKCHAIN_CHAIN_ID
      });
    } catch (error) {
      logger.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  /**
   * Initialize smart contracts
   */
  initializeContracts() {
    const contractAddresses = {
      eduToken: process.env.EDU_TOKEN_ADDRESS,
      learnPassNFT: process.env.LEARNPASS_NFT_ADDRESS,
      certificateNFT: process.env.CERTIFICATE_NFT_ADDRESS,
      factory: process.env.FACTORY_ADDRESS,
      marketplace: process.env.MARKETPLACE_ADDRESS
    };

    // Contract ABIs (simplified - in production, load from JSON files)
    const abis = {
      eduToken: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function transferFrom(address from, address to, uint256 amount) returns (bool)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function mint(address to, uint256 amount)",
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)"
      ],
      learnPassNFT: [
        "function safeMint(address to, string memory studentId, string memory name, string memory email, string memory profilePictureURI, string memory coursesCompletedURI, string memory skillsAcquiredURI, string memory tokenURI) returns (uint256)",
        "function tokenURI(uint256 tokenId) view returns (string)",
        "function ownerOf(uint256 tokenId) view returns (address)",
        "function balanceOf(address owner) view returns (uint256)",
        "function updateLearnPassMetadata(uint256 tokenId, string memory newProfilePictureURI, string memory newCoursesCompletedURI, string memory newSkillsAcquiredURI, string memory newTokenURI)",
        "function learnPasses(uint256 tokenId) view returns (address owner, string memory studentId, string memory name, string memory email, string memory profilePictureURI, string memory coursesCompletedURI, string memory skillsAcquiredURI, uint256 createdAt, uint256 lastUpdated)",
        "function ownerToTokenId(address owner) view returns (uint256)",
        "function grantRole(bytes32 role, address account)",
        "function hasRole(bytes32 role, address account) view returns (bool)"
      ],
      certificateNFT: [
        "function issueCertificate(address student, string memory _certificateId, string memory _courseName, string memory _issuerName, uint256 _issueDate, string memory _gradeOrScore, string memory _skillsCovered, string memory _certificateURI, string memory tokenURI) returns (uint256)",
        "function tokenURI(uint256 tokenId) view returns (string)",
        "function ownerOf(uint256 tokenId) view returns (address)",
        "function balanceOf(address owner) view returns (uint256)",
        "function getCertificateDetails(uint256 tokenId) view returns (tuple(address studentAddress, string certificateId, string courseName, string issuerName, uint256 issueDate, string gradeOrScore, string skillsCovered, string certificateURI, uint256 createdAt))",
        "function getCertificateDetailsById(string memory _certificateId) view returns (tuple(address studentAddress, string certificateId, string courseName, string issuerName, uint256 issueDate, string gradeOrScore, string skillsCovered, string certificateURI, uint256 createdAt))",
        "function verifyCertificate(uint256 tokenId)",
        "function grantRole(bytes32 role, address account)",
        "function hasRole(bytes32 role, address account) view returns (bool)"
      ],
      factory: [
        "function registerUser(address userAddress, string memory studentId, string memory name, string memory email, string memory profilePictureURI, string memory coursesCompletedURI, string memory skillsAcquiredURI, string memory learnPassTokenURI) returns (uint256)",
        "function issueCertificateForUser(address studentAddress, string memory _certificateId, string memory _courseName, string memory _issuerName, uint256 _issueDate, string memory _gradeOrScore, string memory _skillsCovered, string memory _certificateURI, string memory certificateTokenURI) returns (uint256)",
        "function getUserLearnPassId(address userAddress) view returns (uint256)",
        "function getUserCertificates(address userAddress) view returns (uint256[])",
        "function getEduTokenBalance(address account) view returns (uint256)",
        "function transferEduTokens(address from, address to, uint256 amount)",
        "function grantRole(bytes32 role, address account)",
        "function hasRole(bytes32 role, address account) view returns (bool)"
      ],
      marketplace: [
        "function addItem(string memory _name, string memory _description, uint256 _price, uint256 _stock) returns (uint256)",
        "function updateItem(uint256 _itemId, string memory _name, string memory _description, uint256 _price, uint256 _stock, bool _isActive)",
        "function purchaseItem(uint256 _itemId)",
        "function getActiveItems() view returns (tuple(uint256 itemId, string name, string description, uint256 price, uint256 stock, bool isActive, uint256 createdAt, uint256 lastUpdated)[])",
        "function getItemDetails(uint256 _itemId) view returns (tuple(uint256 itemId, string name, string description, uint256 price, uint256 stock, bool isActive, uint256 createdAt, uint256 lastUpdated))"
      ]
    };

    // Initialize contract instances
    for (const [name, address] of Object.entries(contractAddresses)) {
      if (address && abis[name]) {
        this.contracts[name] = new ethers.Contract(address, abis[name], this.wallet || this.provider);
        logger.info(`Contract ${name} initialized`, { address });
      }
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getFeeData();

      return {
        name: network.name,
        chainId: network.chainId.toString(),
        blockNumber,
        gasPrice: gasPrice.gasPrice?.toString(),
        maxFeePerGas: gasPrice.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas?.toString()
      };
    } catch (error) {
      logger.error('Failed to get network info:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(address) {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error('Failed to get wallet balance:', error);
      throw error;
    }
  }

  /**
   * Get EDU token balance
   */
  async getEduTokenBalance(address) {
    try {
      if (!this.contracts.eduToken) {
        throw new Error('EDU Token contract not initialized');
      }

      const balance = await this.contracts.eduToken.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error('Failed to get EDU token balance:', error);
      throw error;
    }
  }

  /**
   * Register a new user and mint LearnPass NFT
   */
  async registerUser(userData) {
    try {
      if (!this.contracts.factory) {
        throw new Error('Factory contract not initialized');
      }

      const {
        userAddress,
        studentId,
        name,
        email,
        profilePictureURI,
        coursesCompletedURI,
        skillsAcquiredURI,
        learnPassTokenURI
      } = userData;

      // Call registerUser function on factory contract
      const tx = await this.contracts.factory.registerUser(
        userAddress,
        studentId,
        name,
        email,
        profilePictureURI || '',
        coursesCompletedURI || '',
        skillsAcquiredURI || '',
        learnPassTokenURI
      );

      const receipt = await tx.wait();
      
      logger.logBlockchainTransaction(tx.hash, 'registerUser', {
        userAddress,
        studentId,
        blockNumber: receipt.blockNumber
      });

      // Extract token ID from events
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contracts.learnPassNFT.interface.parseLog(log);
          return parsed.name === 'LearnPassMinted';
        } catch {
          return false;
        }
      });

      let tokenId = null;
      if (event) {
        const parsed = this.contracts.learnPassNFT.interface.parseLog(event);
        tokenId = parsed.args.tokenId.toString();
      }

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        tokenId,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Failed to register user:', error);
      throw error;
    }
  }

  /**
   * Issue a certificate for a user
   */
  async issueCertificate(certificateData) {
    try {
      if (!this.contracts.factory) {
        throw new Error('Factory contract not initialized');
      }

      const {
        studentAddress,
        certificateId,
        courseName,
        issuerName,
        issueDate,
        gradeOrScore,
        skillsCovered,
        certificateURI,
        certificateTokenURI
      } = certificateData;

      // Call issueCertificateForUser function on factory contract
      const tx = await this.contracts.factory.issueCertificateForUser(
        studentAddress,
        certificateId,
        courseName,
        issuerName,
        issueDate,
        gradeOrScore,
        skillsCovered,
        certificateURI,
        certificateTokenURI
      );

      const receipt = await tx.wait();
      
      logger.logBlockchainTransaction(tx.hash, 'issueCertificate', {
        studentAddress,
        certificateId,
        blockNumber: receipt.blockNumber
      });

      // Extract token ID from events
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contracts.certificateNFT.interface.parseLog(log);
          return parsed.name === 'CertificateIssued';
        } catch {
          return false;
        }
      });

      let tokenId = null;
      if (event) {
        const parsed = this.contracts.certificateNFT.interface.parseLog(event);
        tokenId = parsed.args.tokenId.toString();
      }

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        tokenId,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Failed to issue certificate:', error);
      throw error;
    }
  }

  /**
   * Get user's LearnPass token ID
   */
  async getUserLearnPassId(userAddress) {
    try {
      if (!this.contracts.factory) {
        throw new Error('Factory contract not initialized');
      }

      const tokenId = await this.contracts.factory.getUserLearnPassId(userAddress);
      return tokenId.toString();
    } catch (error) {
      logger.error('Failed to get user LearnPass ID:', error);
      throw error;
    }
  }

  /**
   * Get user's certificates
   */
  async getUserCertificates(userAddress) {
    try {
      if (!this.contracts.factory) {
        throw new Error('Factory contract not initialized');
      }

      const tokenIds = await this.contracts.factory.getUserCertificates(userAddress);
      return tokenIds.map(id => id.toString());
    } catch (error) {
      logger.error('Failed to get user certificates:', error);
      throw error;
    }
  }

  /**
   * Get LearnPass metadata
   */
  async getLearnPassMetadata(tokenId) {
    try {
      if (!this.contracts.learnPassNFT) {
        throw new Error('LearnPass NFT contract not initialized');
      }

      const metadata = await this.contracts.learnPassNFT.learnPasses(tokenId);
      const tokenURI = await this.contracts.learnPassNFT.tokenURI(tokenId);
      const owner = await this.contracts.learnPassNFT.ownerOf(tokenId);

      return {
        tokenId: tokenId.toString(),
        owner,
        studentId: metadata.studentId,
        name: metadata.name,
        email: metadata.email,
        profilePictureURI: metadata.profilePictureURI,
        coursesCompletedURI: metadata.coursesCompletedURI,
        skillsAcquiredURI: metadata.skillsAcquiredURI,
        tokenURI,
        createdAt: new Date(parseInt(metadata.createdAt.toString()) * 1000),
        lastUpdated: new Date(parseInt(metadata.lastUpdated.toString()) * 1000)
      };
    } catch (error) {
      logger.error('Failed to get LearnPass metadata:', error);
      throw error;
    }
  }

  /**
   * Get certificate metadata
   */
  async getCertificateMetadata(tokenId) {
    try {
      if (!this.contracts.certificateNFT) {
        throw new Error('Certificate NFT contract not initialized');
      }

      const metadata = await this.contracts.certificateNFT.getCertificateDetails(tokenId);
      const tokenURI = await this.contracts.certificateNFT.tokenURI(tokenId);
      const owner = await this.contracts.certificateNFT.ownerOf(tokenId);

      return {
        tokenId: tokenId.toString(),
        owner,
        studentAddress: metadata.studentAddress,
        certificateId: metadata.certificateId,
        courseName: metadata.courseName,
        issuerName: metadata.issuerName,
        issueDate: new Date(parseInt(metadata.issueDate.toString()) * 1000),
        gradeOrScore: metadata.gradeOrScore,
        skillsCovered: metadata.skillsCovered,
        certificateURI: metadata.certificateURI,
        tokenURI,
        createdAt: new Date(parseInt(metadata.createdAt.toString()) * 1000)
      };
    } catch (error) {
      logger.error('Failed to get certificate metadata:', error);
      throw error;
    }
  }

  /**
   * Update LearnPass metadata
   */
  async updateLearnPassMetadata(tokenId, updateData) {
    try {
      if (!this.contracts.learnPassNFT) {
        throw new Error('LearnPass NFT contract not initialized');
      }

      const {
        newProfilePictureURI,
        newCoursesCompletedURI,
        newSkillsAcquiredURI,
        newTokenURI
      } = updateData;

      const tx = await this.contracts.learnPassNFT.updateLearnPassMetadata(
        tokenId,
        newProfilePictureURI || '',
        newCoursesCompletedURI || '',
        newSkillsAcquiredURI || '',
        newTokenURI || ''
      );

      const receipt = await tx.wait();
      
      logger.logBlockchainTransaction(tx.hash, 'updateLearnPassMetadata', {
        tokenId,
        blockNumber: receipt.blockNumber
      });

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Failed to update LearnPass metadata:', error);
      throw error;
    }
  }

  /**
   * Verify a certificate
   */
  async verifyCertificate(tokenId) {
    try {
      if (!this.contracts.certificateNFT) {
        throw new Error('Certificate NFT contract not initialized');
      }

      const tx = await this.contracts.certificateNFT.verifyCertificate(tokenId);
      const receipt = await tx.wait();
      
      logger.logBlockchainTransaction(tx.hash, 'verifyCertificate', {
        tokenId,
        blockNumber: receipt.blockNumber
      });

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Failed to verify certificate:', error);
      throw error;
    }
  }

  /**
   * Get marketplace items
   */
  async getMarketplaceItems() {
    try {
      if (!this.contracts.marketplace) {
        throw new Error('Marketplace contract not initialized');
      }

      const items = await this.contracts.marketplace.getActiveItems();
      
      return items.map(item => ({
        itemId: item.itemId.toString(),
        name: item.name,
        description: item.description,
        price: ethers.formatEther(item.price),
        stock: item.stock.toString(),
        isActive: item.isActive,
        createdAt: new Date(parseInt(item.createdAt.toString()) * 1000),
        lastUpdated: new Date(parseInt(item.lastUpdated.toString()) * 1000)
      }));
    } catch (error) {
      logger.error('Failed to get marketplace items:', error);
      throw error;
    }
  }

  /**
   * Purchase marketplace item
   */
  async purchaseMarketplaceItem(itemId, buyerAddress) {
    try {
      if (!this.contracts.marketplace) {
        throw new Error('Marketplace contract not initialized');
      }

      // First, approve the marketplace to spend EDU tokens
      const itemDetails = await this.contracts.marketplace.getItemDetails(itemId);
      const approveTx = await this.contracts.eduToken.approve(
        process.env.MARKETPLACE_ADDRESS,
        itemDetails.price
      );
      await approveTx.wait();

      // Then purchase the item
      const purchaseTx = await this.contracts.marketplace.purchaseItem(itemId);
      const receipt = await purchaseTx.wait();
      
      logger.logBlockchainTransaction(purchaseTx.hash, 'purchaseItem', {
        itemId,
        buyerAddress,
        blockNumber: receipt.blockNumber
      });

      return {
        transactionHash: purchaseTx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Failed to purchase marketplace item:', error);
      throw error;
    }
  }

  /**
   * Transfer EDU tokens
   */
  async transferEduTokens(from, to, amount) {
    try {
      if (!this.contracts.eduToken) {
        throw new Error('EDU Token contract not initialized');
      }

      const tx = await this.contracts.eduToken.transferFrom(
        from,
        to,
        ethers.parseEther(amount.toString())
      );

      const receipt = await tx.wait();
      
      logger.logBlockchainTransaction(tx.hash, 'transferEduTokens', {
        from,
        to,
        amount,
        blockNumber: receipt.blockNumber
      });

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Failed to transfer EDU tokens:', error);
      throw error;
    }
  }

  /**
   * Mint EDU tokens
   */
  async mintEduTokens(to, amount) {
    try {
      if (!this.contracts.eduToken) {
        throw new Error('EDU Token contract not initialized');
      }

      const tx = await this.contracts.eduToken.mint(
        to,
        ethers.parseEther(amount.toString())
      );

      const receipt = await tx.wait();
      
      logger.logBlockchainTransaction(tx.hash, 'mintEduTokens', {
        to,
        amount,
        blockNumber: receipt.blockNumber
      });

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Failed to mint EDU tokens:', error);
      throw error;
    }
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(contractName, methodName, ...args) {
    try {
      if (!this.contracts[contractName]) {
        throw new Error(`Contract ${contractName} not initialized`);
      }

      const gasEstimate = await this.contracts[contractName][methodName].estimateGas(...args);
      return gasEstimate.toString();
    } catch (error) {
      logger.error('Failed to estimate gas:', error);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      logger.error('Failed to get transaction receipt:', error);
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash) {
    try {
      const tx = await this.provider.getTransaction(txHash);
      return tx;
    } catch (error) {
      logger.error('Failed to get transaction:', error);
      throw error;
    }
  }

  /**
   * Check if contract is initialized
   */
  isContractInitialized(contractName) {
    return !!this.contracts[contractName];
  }

  /**
   * Get contract instance
   */
  getContract(contractName) {
    return this.contracts[contractName];
  }

  /**
   * Get provider
   */
  getProvider() {
    return this.provider;
  }

  /**
   * Get wallet
   */
  getWallet() {
    return this.wallet;
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;
