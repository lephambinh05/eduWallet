// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { EDUToken } from "./EDUToken.sol";
import { LearnPassNFT } from "./LearnPassNFT.sol";
import { CertificateNFT } from "./CertificateNFT.sol";

/**
 * @title EduWalletFactory
 * @dev Factory contract for managing the EduWallet ecosystem
 * @notice This contract manages all core contracts and provides centralized access control
 */
contract EduWalletFactory is Ownable, AccessControl {
    
    // ========== STATE VARIABLES ==========
    
    /// @notice Role identifier for administrators who can manage the system
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    /// @notice Role identifier for institutions who can issue certificates and LearnPass
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");
    
    /// @notice Role identifier for verifiers who can verify certificates
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    /// @notice Address of the EDU Token contract
    address public eduTokenAddress;
    
    /// @notice Address of the LearnPass NFT contract
    address public learnPassNFTAddress;
    
    /// @notice Address of the Certificate NFT contract
    address public certificateNFTAddress;
    
    /// @notice Address of the Marketplace contract
    address public marketplaceAddress;
    
    /// @notice Mapping from institution address to institution data
    mapping(address => InstitutionData) public institutions;
    
    /// @notice Array of all registered institution addresses
    address[] public institutionAddresses;
    
    /// @notice Mapping from student address to their LearnPass token ID
    mapping(address => uint256) public studentLearnPasses;
    
    /// @notice Mapping from student address to array of certificate token IDs
    mapping(address => uint256[]) public studentCertificates;
    
    /// @notice System statistics
    SystemStats public systemStats;
    
    // ========== STRUCTS ==========
    
    /**
     * @dev Structure to store institution data
     * @param name Name of the institution
     * @param institutionId Unique institution identifier
     * @param institutionType Type of institution (university, college, training center, etc.)
     * @param country Country where the institution is located
     * @param website Institution website URL
     * @param isVerified Whether the institution is verified
     * @param isActive Whether the institution is active
     * @param registeredAt Timestamp when the institution was registered
     * @param verifiedAt Timestamp when the institution was verified
     * @param verifiedBy Address that verified the institution
     */
    struct InstitutionData {
        string name;
        string institutionId;
        string institutionType;
        string country;
        string website;
        bool isVerified;
        bool isActive;
        uint256 registeredAt;
        uint256 verifiedAt;
        address verifiedBy;
    }
    
    /**
     * @dev Structure to store system statistics
     * @param totalInstitutions Total number of registered institutions
     * @param verifiedInstitutions Number of verified institutions
     * @param totalLearnPasses Number of LearnPass NFTs minted
     * @param totalCertificates Number of Certificate NFTs minted
     * @param totalEDUTokens Total EDU tokens in circulation
     * @param totalRewardsDistributed Total EDU tokens distributed as rewards
     */
    struct SystemStats {
        uint256 totalInstitutions;
        uint256 verifiedInstitutions;
        uint256 totalLearnPasses;
        uint256 totalCertificates;
        uint256 totalEDUTokens;
        uint256 totalRewardsDistributed;
    }
    
    // ========== EVENTS ==========
    
    /**
     * @dev Emitted when a new institution is registered
     * @param institution Address of the registered institution
     * @param name Name of the institution
     * @param institutionId Unique institution identifier
     * @param registeredBy Address that registered the institution
     * @param timestamp When the registration occurred
     */
    event InstitutionRegistered(
        address indexed institution,
        string name,
        string institutionId,
        address indexed registeredBy,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when an institution is verified
     * @param institution Address of the verified institution
     * @param verifiedBy Address that verified the institution
     * @param timestamp When the verification occurred
     */
    event InstitutionVerified(address indexed institution, address indexed verifiedBy, uint256 timestamp);
    
    /**
     * @dev Emitted when an institution is deactivated
     * @param institution Address of the deactivated institution
     * @param deactivatedBy Address that deactivated the institution
     * @param timestamp When the deactivation occurred
     */
    event InstitutionDeactivated(address indexed institution, address indexed deactivatedBy, uint256 timestamp);
    
    /**
     * @dev Emitted when a LearnPass is created
     * @param student Address of the student
     * @param tokenId ID of the LearnPass NFT
     * @param institution Address of the issuing institution
     * @param timestamp When the LearnPass was created
     */
    event LearnPassCreated(
        address indexed student,
        uint256 indexed tokenId,
        address indexed institution,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when a certificate is issued
     * @param student Address of the student
     * @param tokenId ID of the Certificate NFT
     * @param institution Address of the issuing institution
     * @param courseName Name of the course
     * @param timestamp When the certificate was issued
     */
    event CertificateIssued(
        address indexed student,
        uint256 indexed tokenId,
        address indexed institution,
        string courseName,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when EDU tokens are distributed as rewards
     * @param recipient Address receiving the reward
     * @param amount Amount of EDU tokens
     * @param reason Reason for the reward
     * @param timestamp When the reward was distributed
     */
    event RewardDistributed(
        address indexed recipient,
        uint256 amount,
        string reason,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when system statistics are updated
     * @param totalInstitutions New total institutions count
     * @param totalLearnPasses New total LearnPasses count
     * @param totalCertificates New total certificates count
     * @param timestamp When the update occurred
     */
    event SystemStatsUpdated(
        uint256 totalInstitutions,
        uint256 totalLearnPasses,
        uint256 totalCertificates,
        uint256 timestamp
    );
    
    // ========== CONSTRUCTOR ==========
    
    /**
     * @dev Constructor to initialize the EduWallet Factory
     * @param initialOwner Address that will be the initial owner and admin
     */
    constructor(address initialOwner) Ownable(initialOwner) {
        // Grant roles to the initial owner
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(ADMIN_ROLE, initialOwner);
        _grantRole(VERIFIER_ROLE, initialOwner);
        
        // Initialize system statistics
        systemStats = SystemStats({
            totalInstitutions: 0,
            verifiedInstitutions: 0,
            totalLearnPasses: 0,
            totalCertificates: 0,
            totalEDUTokens: 0,
            totalRewardsDistributed: 0
        });
    }
    
    // ========== MODIFIERS ==========
    
    /**
     * @dev Modifier to ensure only verified institutions can perform actions
     */
    modifier onlyVerifiedInstitution() {
        require(
            institutions[msg.sender].isVerified && institutions[msg.sender].isActive,
            "Only verified institutions can perform this action"
        );
        _;
    }
    
    /**
     * @dev Modifier to ensure contracts are initialized
     */
    modifier contractsInitialized() {
        require(eduTokenAddress != address(0), "EDU Token not initialized");
        require(learnPassNFTAddress != address(0), "LearnPass NFT not initialized");
        require(certificateNFTAddress != address(0), "Certificate NFT not initialized");
        _;
    }
    
    // ========== INITIALIZATION FUNCTIONS ==========
    
    /**
     * @dev Initialize core contracts
     * @param _eduToken Address of the EDU Token contract
     * @param _learnPassNFT Address of the LearnPass NFT contract
     * @param _certificateNFT Address of the Certificate NFT contract
     * @notice Only owner can call this function
     * @notice Can only be called once
     */
    function initializeContracts(
        address _eduToken,
        address _learnPassNFT,
        address _certificateNFT
    ) external onlyOwner {
        require(eduTokenAddress == address(0), "Contracts already initialized");
        require(_eduToken != address(0), "Invalid EDU Token address");
        require(_learnPassNFT != address(0), "Invalid LearnPass NFT address");
        require(_certificateNFT != address(0), "Invalid Certificate NFT address");
        
        eduTokenAddress = _eduToken;
        learnPassNFTAddress = _learnPassNFT;
        certificateNFTAddress = _certificateNFT;
        
        // Grant necessary roles to this factory contract
        EDUToken(_eduToken).grantRole(EDUToken.MINTER_ROLE, address(this));
        LearnPassNFT(_learnPassNFT).grantRole(LearnPassNFT.MINTER_ROLE, address(this));
        LearnPassNFT(_learnPassNFT).grantRole(LearnPassNFT.UPDATER_ROLE, address(this));
        CertificateNFT(_certificateNFT).grantRole(CertificateNFT.ISSUER_ROLE, address(this));
        CertificateNFT(_certificateNFT).grantRole(CertificateNFT.VERIFIER_ROLE, address(this));
    }
    
    /**
     * @dev Set marketplace contract address
     * @param _marketplace Address of the marketplace contract
     * @notice Only owner can call this function
     */
    function setMarketplace(address _marketplace) external onlyOwner {
        require(_marketplace != address(0), "Invalid marketplace address");
        marketplaceAddress = _marketplace;
    }
    
    // ========== INSTITUTION MANAGEMENT ==========
    
    /**
     * @dev Register a new educational institution
     * @param institution Address of the institution
     * @param name Name of the institution
     * @param institutionId Unique institution identifier
     * @param institutionType Type of institution
     * @param country Country where the institution is located
     * @param website Institution website URL
     * @notice Only admin can call this function
     */
    function registerInstitution(
        address institution,
        string calldata name,
        string calldata institutionId,
        string calldata institutionType,
        string calldata country,
        string calldata website
    ) external onlyRole(ADMIN_ROLE) {
        require(institution != address(0), "Invalid institution address");
        require(bytes(name).length > 0, "Institution name cannot be empty");
        require(bytes(institutionId).length > 0, "Institution ID cannot be empty");
        require(!institutions[institution].isActive, "Institution already registered");
        
        institutions[institution] = InstitutionData({
            name: name,
            institutionId: institutionId,
            institutionType: institutionType,
            country: country,
            website: website,
            isVerified: false,
            isActive: true,
            registeredAt: block.timestamp,
            verifiedAt: 0,
            verifiedBy: address(0)
        });
        
        institutionAddresses.push(institution);
        systemStats.totalInstitutions++;
        
        // Grant institution role
        _grantRole(INSTITUTION_ROLE, institution);
        
        emit InstitutionRegistered(institution, name, institutionId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Verify an educational institution
     * @param institution Address of the institution
     * @notice Only admin can call this function
     */
    function verifyInstitution(address institution) external onlyRole(ADMIN_ROLE) {
        require(institutions[institution].isActive, "Institution not found or inactive");
        require(!institutions[institution].isVerified, "Institution already verified");
        
        institutions[institution].isVerified = true;
        institutions[institution].verifiedAt = block.timestamp;
        institutions[institution].verifiedBy = msg.sender;
        
        systemStats.verifiedInstitutions++;
        
        // Verify institution in EDU Token contract
        EDUToken(eduTokenAddress).verifyInstitution(institution);
        
        emit InstitutionVerified(institution, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Deactivate an educational institution
     * @param institution Address of the institution
     * @notice Only admin can call this function
     */
    function deactivateInstitution(address institution) external onlyRole(ADMIN_ROLE) {
        require(institutions[institution].isActive, "Institution not found or already inactive");
        
        institutions[institution].isActive = false;
        
        if (institutions[institution].isVerified) {
            systemStats.verifiedInstitutions--;
        }
        
        // Revoke institution role
        _revokeRole(INSTITUTION_ROLE, institution);
        
        // Revoke institution verification in EDU Token contract
        EDUToken(eduTokenAddress).revokeInstitutionVerification(institution);
        
        emit InstitutionDeactivated(institution, msg.sender, block.timestamp);
    }
    
    // ========== LEARNPASS MANAGEMENT ==========
    
    /**
     * @dev Create a new LearnPass for a student
     * @param student Address of the student
     * @param studentData LearnPass data
     * @return tokenId ID of the created LearnPass NFT
     * @notice Only verified institutions can call this function
     */
    function createLearnPass(address student, LearnPassNFT.LearnPassData calldata studentData) 
        external 
        onlyVerifiedInstitution 
        contractsInitialized 
        returns (uint256) 
    {
        require(student != address(0), "Invalid student address");
        require(studentLearnPasses[student] == 0, "Student already has a LearnPass");
        
        // Set institution address to the caller
        LearnPassNFT.LearnPassData memory data = studentData;
        data.institutionAddress = msg.sender;
        
        // Mint LearnPass NFT
        uint256 tokenId = LearnPassNFT(learnPassNFTAddress).mintLearnPass(student, data);
        
        // Update mappings and statistics
        studentLearnPasses[student] = tokenId;
        systemStats.totalLearnPasses++;
        
        emit LearnPassCreated(student, tokenId, msg.sender, block.timestamp);
        emit SystemStatsUpdated(
            systemStats.totalInstitutions,
            systemStats.totalLearnPasses,
            systemStats.totalCertificates,
            block.timestamp
        );
        
        return tokenId;
    }
    
    // ========== CERTIFICATE MANAGEMENT ==========
    
    /**
     * @dev Issue a new certificate to a student
     * @param student Address of the student
     * @param certData Certificate data
     * @return tokenId ID of the issued Certificate NFT
     * @notice Only verified institutions can call this function
     */
    function issueCertificate(address student, CertificateNFT.CertificateData calldata certData) 
        external 
        onlyVerifiedInstitution 
        contractsInitialized 
        returns (uint256) 
    {
        require(student != address(0), "Invalid student address");
        
        // Set institution address to the caller
        CertificateNFT.CertificateData memory data = certData;
        data.issuerAddress = msg.sender;
        data.studentAddress = student;
        
        // Mint Certificate NFT
        uint256 tokenId = CertificateNFT(certificateNFTAddress).mintCertificate(student, data);
        
        // Update mappings and statistics
        studentCertificates[student].push(tokenId);
        systemStats.totalCertificates++;
        
        emit CertificateIssued(student, tokenId, msg.sender, certData.courseName, block.timestamp);
        emit SystemStatsUpdated(
            systemStats.totalInstitutions,
            systemStats.totalLearnPasses,
            systemStats.totalCertificates,
            block.timestamp
        );
        
        return tokenId;
    }
    
    // ========== REWARD MANAGEMENT ==========
    
    /**
     * @dev Distribute EDU tokens as rewards
     * @param recipient Address to receive the reward
     * @param amount Amount of EDU tokens
     * @param reason Reason for the reward
     * @notice Only verified institutions can call this function
     */
    function distributeReward(address recipient, uint256 amount, string calldata reason) 
        external 
        onlyVerifiedInstitution 
        contractsInitialized 
    {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than zero");
        require(bytes(reason).length > 0, "Reason cannot be empty");
        
        // Mint reward tokens
        EDUToken(eduTokenAddress).mintReward(recipient, amount, reason);
        
        // Update statistics
        systemStats.totalEDUTokens += amount;
        systemStats.totalRewardsDistributed += amount;
        
        emit RewardDistributed(recipient, amount, reason, block.timestamp);
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get institution data
     * @param institution Address of the institution
     * @return Institution data struct
     */
    function getInstitutionData(address institution) external view returns (InstitutionData memory) {
        return institutions[institution];
    }
    
    /**
     * @dev Get all institution addresses
     * @return Array of institution addresses
     */
    function getAllInstitutions() external view returns (address[] memory) {
        return institutionAddresses;
    }
    
    /**
     * @dev Get student's LearnPass token ID
     * @param student Address of the student
     * @return Token ID (0 if no LearnPass exists)
     */
    function getStudentLearnPass(address student) external view returns (uint256) {
        return studentLearnPasses[student];
    }
    
    /**
     * @dev Get student's certificates
     * @param student Address of the student
     * @return Array of certificate token IDs
     */
    function getStudentCertificates(address student) external view returns (uint256[] memory) {
        return studentCertificates[student];
    }
    
    /**
     * @dev Get system statistics
     * @return System statistics struct
     */
    function getSystemStats() external view returns (SystemStats memory) {
        return systemStats;
    }
    
    /**
     * @dev Check if an address is a verified institution
     * @param institution Address to check
     * @return True if the address is a verified institution
     */
    function isVerifiedInstitution(address institution) external view returns (bool) {
        return institutions[institution].isVerified && institutions[institution].isActive;
    }
    
    /**
     * @dev Get contract addresses
     * @return eduToken Address of EDU Token contract
     * @return learnPassNFT Address of LearnPass NFT contract
     * @return certificateNFT Address of Certificate NFT contract
     * @return marketplace Address of Marketplace contract
     */
    function getContractAddresses() external view returns (
        address eduToken,
        address learnPassNFT,
        address certificateNFT,
        address marketplace
    ) {
        return (eduTokenAddress, learnPassNFTAddress, certificateNFTAddress, marketplaceAddress);
    }
    
    // ========== OVERRIDE FUNCTIONS ==========
    
    /**
     * @dev Override supportsInterface to support AccessControl
     */
    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
