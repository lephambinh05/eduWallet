const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EduWallet System", function () {
  let owner, institution1, institution2, student1, student2, verifier;
  let eduToken, learnPassNFT, certificateNFT, factory, marketplace;
  
  const baseTokenURI = "https://api.eduwallet.com/metadata/";

  beforeEach(async function () {
    [owner, institution1, institution2, student1, student2, verifier] = await ethers.getSigners();

    // Deploy EDU Token
    const EDUToken = await ethers.getContractFactory("EDUToken");
    eduToken = await EDUToken.deploy(owner.address);
    await eduToken.waitForDeployment();

    // Deploy LearnPass NFT
    const LearnPassNFT = await ethers.getContractFactory("LearnPassNFT");
    learnPassNFT = await LearnPassNFT.deploy(owner.address, baseTokenURI + "learnpass/");
    await learnPassNFT.waitForDeployment();

    // Deploy Certificate NFT
    const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
    certificateNFT = await CertificateNFT.deploy(owner.address, baseTokenURI + "certificate/");
    await certificateNFT.waitForDeployment();

    // Deploy Factory
    const EduWalletFactory = await ethers.getContractFactory("EduWalletFactory");
    factory = await EduWalletFactory.deploy(owner.address);
    await factory.waitForDeployment();

    // Deploy Marketplace
    const EduWalletMarketplace = await ethers.getContractFactory("EduWalletMarketplace");
    marketplace = await EduWalletMarketplace.deploy(owner.address, await eduToken.getAddress(), await factory.getAddress());
    await marketplace.waitForDeployment();

    // Initialize Factory
    await factory.initializeContracts(
      await eduToken.getAddress(),
      await learnPassNFT.getAddress(),
      await certificateNFT.getAddress()
    );

    // Set marketplace in factory
    await factory.setMarketplace(await marketplace.getAddress());

    // Grant necessary roles
    await eduToken.grantRole(await eduToken.MINTER_ROLE(), await factory.getAddress());
    await learnPassNFT.grantRole(await learnPassNFT.MINTER_ROLE(), await factory.getAddress());
    await learnPassNFT.grantRole(await learnPassNFT.UPDATER_ROLE(), await factory.getAddress());
    await certificateNFT.grantRole(await certificateNFT.ISSUER_ROLE(), await factory.getAddress());
    await certificateNFT.grantRole(await certificateNFT.VERIFIER_ROLE(), await factory.getAddress());
    await marketplace.grantRole(await marketplace.MERCHANT_ROLE(), await factory.getAddress());
  });

  describe("EDU Token", function () {
    it("Should have correct name and symbol", async function () {
      expect(await eduToken.name()).to.equal("EduWallet Token");
      expect(await eduToken.symbol()).to.equal("EDU");
    });

    it("Should have correct initial supply", async function () {
      const totalSupply = await eduToken.totalSupply();
      const maxSupply = await eduToken.MAX_SUPPLY();
      expect(totalSupply).to.equal(maxSupply / 10n); // 10% of max supply
    });

    it("Should allow minting rewards", async function () {
      const amount = ethers.parseEther("100");
      await eduToken.mintReward(student1.address, amount, "test_reward");
      
      expect(await eduToken.balanceOf(student1.address)).to.equal(amount);
    });

    it("Should verify institutions", async function () {
      await eduToken.verifyInstitution(institution1.address);
      expect(await eduToken.isVerifiedInstitution(institution1.address)).to.be.true;
    });
  });

  describe("LearnPass NFT", function () {
    it("Should have correct name and symbol", async function () {
      expect(await learnPassNFT.name()).to.equal("EduWallet LearnPass");
      expect(await learnPassNFT.symbol()).to.equal("LEARNPASS");
    });

    it("Should mint LearnPass for student", async function () {
      const studentData = {
        studentName: "John Doe",
        studentId: "STU001",
        institutionName: "Test University",
        institutionAddress: institution1.address,
        dateOfBirth: 946684800, // 2000-01-01
        enrollmentDate: Math.floor(Date.now() / 1000),
        graduationDate: 0,
        gpa: 350, // 3.50
        major: "Computer Science",
        degreeType: "Bachelor",
        isActive: true,
        createdAt: 0,
        lastUpdated: 0
      };

      await learnPassNFT.mintLearnPass(student1.address, studentData);
      
      expect(await learnPassNFT.balanceOf(student1.address)).to.equal(1);
      expect(await learnPassNFT.hasLearnPass(student1.address)).to.be.true;
    });

    it("Should add course completion", async function () {
      // First mint a LearnPass
      const studentData = {
        studentName: "John Doe",
        studentId: "STU001",
        institutionName: "Test University",
        institutionAddress: institution1.address,
        dateOfBirth: 946684800,
        enrollmentDate: Math.floor(Date.now() / 1000),
        graduationDate: 0,
        gpa: 0,
        major: "Computer Science",
        degreeType: "Bachelor",
        isActive: true,
        createdAt: 0,
        lastUpdated: 0
      };

      await learnPassNFT.mintLearnPass(student1.address, studentData);
      const tokenId = await learnPassNFT.getTokenIdByStudent(student1.address);

      // Add course completion
      const courseData = {
        courseId: "CS101",
        courseName: "Introduction to Computer Science",
        creditHours: 3,
        grade: 850, // 85%
        completionDate: Math.floor(Date.now() / 1000),
        instructorName: "Dr. Smith",
        institutionAddress: institution1.address
      };

      await learnPassNFT.addCourseCompletion(tokenId, courseData);
      
      const completions = await learnPassNFT.getCourseCompletions(tokenId);
      expect(completions.length).to.equal(1);
      expect(completions[0].courseName).to.equal("Introduction to Computer Science");
    });
  });

  describe("Certificate NFT", function () {
    it("Should have correct name and symbol", async function () {
      expect(await certificateNFT.name()).to.equal("EduWallet Certificate");
      expect(await certificateNFT.symbol()).to.equal("CERT");
    });

    it("Should mint certificate", async function () {
      const certData = {
        certificateId: "CERT001",
        studentName: "John Doe",
        studentAddress: student1.address,
        courseName: "Blockchain Fundamentals",
        courseId: "CS201",
        issuerName: "Test University",
        issuerAddress: institution1.address,
        completionDate: Math.floor(Date.now() / 1000),
        issueDate: Math.floor(Date.now() / 1000),
        expiryDate: 0,
        grade: 900, // 90%
        creditHours: 3,
        certificateType: "Course Completion",
        skills: ["Blockchain", "Smart Contracts"],
        isVerified: false,
        verifiedBy: ethers.ZeroAddress,
        verifiedAt: 0,
        isRevoked: false,
        revokedBy: ethers.ZeroAddress,
        revokedAt: 0,
        revocationReason: ""
      };

      await certificateNFT.mintCertificate(student1.address, certData);
      
      expect(await certificateNFT.balanceOf(student1.address)).to.equal(1);
    });

    it("Should verify certificate", async function () {
      // First mint a certificate
      const certData = {
        certificateId: "CERT001",
        studentName: "John Doe",
        studentAddress: student1.address,
        courseName: "Blockchain Fundamentals",
        courseId: "CS201",
        issuerName: "Test University",
        issuerAddress: institution1.address,
        completionDate: Math.floor(Date.now() / 1000),
        issueDate: Math.floor(Date.now() / 1000),
        expiryDate: 0,
        grade: 900,
        creditHours: 3,
        certificateType: "Course Completion",
        skills: ["Blockchain", "Smart Contracts"],
        isVerified: false,
        verifiedBy: ethers.ZeroAddress,
        verifiedAt: 0,
        isRevoked: false,
        revokedBy: ethers.ZeroAddress,
        revokedAt: 0,
        revocationReason: ""
      };

      await certificateNFT.mintCertificate(student1.address, certData);
      const tokenId = 1;

      // Grant verifier role and verify
      await certificateNFT.grantRole(await certificateNFT.VERIFIER_ROLE(), verifier.address);
      await certificateNFT.connect(verifier).verifyCertificate(tokenId);
      
      const certInfo = await certificateNFT.getCertificateData(tokenId);
      expect(certInfo.isVerified).to.be.true;
      expect(certInfo.verifiedBy).to.equal(verifier.address);
    });
  });

  describe("Factory", function () {
    it("Should register institution", async function () {
      await factory.registerInstitution(
        institution1.address,
        "Test University",
        "TU001",
        "University",
        "Vietnam",
        "https://testuniversity.edu"
      );

      const institutionData = await factory.getInstitutionData(institution1.address);
      expect(institutionData.name).to.equal("Test University");
      expect(institutionData.isActive).to.be.true;
    });

    it("Should verify institution", async function () {
      // First register institution
      await factory.registerInstitution(
        institution1.address,
        "Test University",
        "TU001",
        "University",
        "Vietnam",
        "https://testuniversity.edu"
      );

      // Then verify it
      await factory.verifyInstitution(institution1.address);
      
      const institutionData = await factory.getInstitutionData(institution1.address);
      expect(institutionData.isVerified).to.be.true;
    });

    it("Should create LearnPass through factory", async function () {
      // Register and verify institution
      await factory.registerInstitution(
        institution1.address,
        "Test University",
        "TU001",
        "University",
        "Vietnam",
        "https://testuniversity.edu"
      );
      await factory.verifyInstitution(institution1.address);

      // Create LearnPass
      const studentData = {
        studentName: "John Doe",
        studentId: "STU001",
        institutionName: "Test University",
        institutionAddress: institution1.address,
        dateOfBirth: 946684800,
        enrollmentDate: Math.floor(Date.now() / 1000),
        graduationDate: 0,
        gpa: 350,
        major: "Computer Science",
        degreeType: "Bachelor",
        isActive: true,
        createdAt: 0,
        lastUpdated: 0
      };

      await factory.connect(institution1).createLearnPass(student1.address, studentData);
      
      expect(await factory.getStudentLearnPass(student1.address)).to.equal(1);
    });
  });

  describe("Marketplace", function () {
    beforeEach(async function () {
      // Mint some EDU tokens to students for testing
      await eduToken.mintReward(student1.address, ethers.parseEther("1000"), "test_reward");
      await eduToken.mintReward(student2.address, ethers.parseEther("1000"), "test_reward");
    });

    it("Should add product", async function () {
      await marketplace.addProduct(
        "Test Course",
        "A test course for learning",
        "Education",
        ethers.parseEther("100"),
        10,
        true,
        "Digital delivery"
      );

      const product = await marketplace.getProduct(1);
      expect(product.name).to.equal("Test Course");
      expect(product.price).to.equal(ethers.parseEther("100"));
    });

    it("Should purchase product", async function () {
      // Add product
      await marketplace.addProduct(
        "Test Course",
        "A test course for learning",
        "Education",
        ethers.parseEther("100"),
        10,
        true,
        "Digital delivery"
      );

      // Approve EDU tokens
      await eduToken.connect(student1).approve(await marketplace.getAddress(), ethers.parseEther("100"));

      // Purchase product
      await marketplace.connect(student1).purchaseProduct(1, 1, "");

      const purchase = await marketplace.getPurchase(1);
      expect(purchase.buyer).to.equal(student1.address);
      expect(purchase.productId).to.equal(1);
      expect(purchase.totalPrice).to.equal(ethers.parseEther("100"));
    });

    it("Should update purchase status", async function () {
      // Add product and purchase it
      await marketplace.addProduct(
        "Test Course",
        "A test course for learning",
        "Education",
        ethers.parseEther("100"),
        10,
        true,
        "Digital delivery"
      );

      await eduToken.connect(student1).approve(await marketplace.getAddress(), ethers.parseEther("100"));
      await marketplace.connect(student1).purchaseProduct(1, 1, "");

      // Update purchase status
      await marketplace.updatePurchaseStatus(1, 1, "TRK123456"); // Shipped status

      const purchase = await marketplace.getPurchase(1);
      expect(purchase.status).to.equal(1); // Shipped
      expect(purchase.trackingNumber).to.equal("TRK123456");
    });
  });

  describe("Integration Tests", function () {
    it("Should complete full student journey", async function () {
      // 1. Register and verify institution
      await factory.registerInstitution(
        institution1.address,
        "Test University",
        "TU001",
        "University",
        "Vietnam",
        "https://testuniversity.edu"
      );
      await factory.verifyInstitution(institution1.address);

      // 2. Create LearnPass for student
      const studentData = {
        studentName: "John Doe",
        studentId: "STU001",
        institutionName: "Test University",
        institutionAddress: institution1.address,
        dateOfBirth: 946684800,
        enrollmentDate: Math.floor(Date.now() / 1000),
        graduationDate: 0,
        gpa: 0,
        major: "Computer Science",
        degreeType: "Bachelor",
        isActive: true,
        createdAt: 0,
        lastUpdated: 0
      };

      await factory.connect(institution1).createLearnPass(student1.address, studentData);

      // 3. Issue certificate
      const certData = {
        certificateId: "CERT001",
        studentName: "John Doe",
        studentAddress: student1.address,
        courseName: "Blockchain Fundamentals",
        courseId: "CS201",
        issuerName: "Test University",
        issuerAddress: institution1.address,
        completionDate: Math.floor(Date.now() / 1000),
        issueDate: Math.floor(Date.now() / 1000),
        expiryDate: 0,
        grade: 900,
        creditHours: 3,
        certificateType: "Course Completion",
        skills: ["Blockchain", "Smart Contracts"],
        isVerified: false,
        verifiedBy: ethers.ZeroAddress,
        verifiedAt: 0,
        isRevoked: false,
        revokedBy: ethers.ZeroAddress,
        revokedAt: 0,
        revocationReason: ""
      };

      await factory.connect(institution1).issueCertificate(student1.address, certData);

      // 4. Distribute reward
      await factory.connect(institution1).distributeReward(
        student1.address,
        ethers.parseEther("100"),
        "course_completion"
      );

      // 5. Verify student has LearnPass, certificate, and reward
      expect(await factory.getStudentLearnPass(student1.address)).to.equal(1);
      const certificates = await factory.getStudentCertificates(student1.address);
      expect(certificates.length).to.equal(1);
      expect(await eduToken.balanceOf(student1.address)).to.be.greaterThan(0);

      // 6. Check system statistics
      const stats = await factory.getSystemStats();
      expect(stats.totalInstitutions).to.equal(1);
      expect(stats.verifiedInstitutions).to.equal(1);
      expect(stats.totalLearnPasses).to.equal(1);
      expect(stats.totalCertificates).to.equal(1);
    });
  });
});
