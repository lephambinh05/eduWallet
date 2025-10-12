// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { ERC721Burnable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Counters } from "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CertificateNFT
 * @dev NFT contract for Educational Certificates
 * @notice Each Certificate NFT represents a verified educational achievement or completion
 */
contract CertificateNFT is ERC721, ERC721URIStorage, ERC721Burnable, AccessControl {
    
    using Counters for Counters.Counter;
    
    // ========== STATE VARIABLES ==========
    
    /// @notice Counter for token IDs
    Counters.Counter private _tokenIdCounter;
    
    /// @notice Role identifier for issuers who can create new certificates
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    
    /// @notice Role identifier for verifiers who can verify certificates
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    /// @notice Base URI for token metadata
    string private _baseTokenURI;
    
    /// @notice Mapping from token ID to certificate data
    mapping(uint256 => CertificateData) public certificateData;
    
    /// @notice Mapping from certificate hash to token ID (for verification)
    mapping(bytes32 => uint256) public certificateHashToTokenId;
    
    /// @notice Mapping from student address to array of certificate token IDs
    mapping(address => uint256[]) public studentCertificates;
    
    /// @notice Mapping from issuer address to array of issued certificate token IDs
    mapping(address => uint256[]) public issuerCertificates;
    
    /// @notice Mapping from course ID to array of certificate token IDs
    mapping(string => uint256[]) public courseCertificates;
    
    // ========== STRUCTS ==========
    
    /**
     * @dev Structure to store certificate data
     * @param certificateId Unique certificate identifier
     * @param studentName Full name of the student
     * @param studentAddress Address of the student
     * @param courseName Name of the course/program
     * @param courseId Unique course identifier
     * @param issuerName Name of the issuing institution
     * @param issuerAddress Address of the issuing institution
     * @param completionDate Date of completion (timestamp)
     * @param issueDate Date when certificate was issued (timestamp)
     * @param expiryDate Date when certificate expires (timestamp, 0 if no expiry)
     * @param grade Grade/score received (scaled by 100)
     * @param creditHours Number of credit hours
     * @param certificateType Type of certificate (course, degree, certification, etc.)
     * @param skills Array of skills acquired
     * @param isVerified Whether the certificate has been verified
     * @param verifiedBy Address that verified the certificate
     * @param verifiedAt Timestamp when verification occurred
     * @param isRevoked Whether the certificate has been revoked
     * @param revokedBy Address that revoked the certificate
     * @param revokedAt Timestamp when revocation occurred
     * @param revocationReason Reason for revocation
     */
    struct CertificateData {
        string certificateId;
        string studentName;
        address studentAddress;
        string courseName;
        string courseId;
        string issuerName;
        address issuerAddress;
        uint256 completionDate;
        uint256 issueDate;
        uint256 expiryDate;
        uint256 grade; // Scaled by 100 (850 = 85%)
        uint256 creditHours;
        string certificateType;
        string[] skills;
        bool isVerified;
        address verifiedBy;
        uint256 verifiedAt;
        bool isRevoked;
        address revokedBy;
        uint256 revokedAt;
        string revocationReason;
    }
    
    // ========== EVENTS ==========
    
    /**
     * @dev Emitted when a new certificate NFT is minted
     * @param tokenId ID of the minted token
     * @param student Address of the student
     * @param courseName Name of the course
     * @param issuerAddress Address of the issuing institution
     * @param timestamp When the certificate was issued
     */
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed student,
        string courseName,
        address indexed issuerAddress,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when a certificate is verified
     * @param tokenId ID of the verified token
     * @param verifiedBy Address that verified the certificate
     * @param timestamp When the verification occurred
     */
    event CertificateVerified(uint256 indexed tokenId, address indexed verifiedBy, uint256 timestamp);
    
    /**
     * @dev Emitted when a certificate is revoked
     * @param tokenId ID of the revoked token
     * @param revokedBy Address that revoked the certificate
     * @param reason Reason for revocation
     * @param timestamp When the revocation occurred
     */
    event CertificateRevoked(
        uint256 indexed tokenId,
        address indexed revokedBy,
        string reason,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when certificate data is updated
     * @param tokenId ID of the updated token
     * @param updatedBy Address that updated the data
     * @param timestamp When the update occurred
     */
    event CertificateUpdated(uint256 indexed tokenId, address indexed updatedBy, uint256 timestamp);
    
    // ========== CONSTRUCTOR ==========
    
    /**
     * @dev Constructor to initialize the Certificate NFT contract
     * @param initialOwner Address that will be the initial owner and admin
     * @param baseTokenURI Base URI for token metadata
     */
    constructor(address initialOwner, string memory baseTokenURI) 
        ERC721("EduWallet Certificate", "CERT") 
        Ownable(initialOwner) 
    {
        _baseTokenURI = baseTokenURI;
        
        // Grant roles to the initial owner
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(ISSUER_ROLE, initialOwner);
        _grantRole(VERIFIER_ROLE, initialOwner);
    }
    
    // ========== MODIFIERS ==========
    
    /**
     * @dev Modifier to ensure certificate exists and is not revoked
     * @param tokenId ID of the token to check
     */
    modifier validCertificate(uint256 tokenId) {
        require(_exists(tokenId), "Certificate does not exist");
        require(!certificateData[tokenId].isRevoked, "Certificate has been revoked");
        _;
    }
    
    // ========== MINTING FUNCTIONS ==========
    
    /**
     * @dev Mint a new certificate NFT
     * @param to Address of the student
     * @param certData Certificate data
     * @return tokenId ID of the minted token
     * @notice Only addresses with ISSUER_ROLE can call this function
     */
    function mintCertificate(address to, CertificateData calldata certData) 
        external 
        onlyRole(ISSUER_ROLE) 
        returns (uint256) 
    {
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(certData.certificateId).length > 0, "Certificate ID cannot be empty");
        require(bytes(certData.studentName).length > 0, "Student name cannot be empty");
        require(bytes(certData.courseName).length > 0, "Course name cannot be empty");
        require(certData.issuerAddress != address(0), "Invalid issuer address");
        require(certData.completionDate > 0, "Invalid completion date");
        require(certData.issueDate > 0, "Invalid issue date");
        require(certData.grade <= 10000, "Grade cannot exceed 100.00%");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        // Create certificate hash for verification
        bytes32 certHash = keccak256(abi.encodePacked(
            certData.certificateId,
            certData.studentName,
            certData.courseName,
            certData.issuerAddress,
            certData.completionDate,
            certData.issueDate
        ));
        
        require(certificateHashToTokenId[certHash] == 0, "Certificate with this data already exists");
        
        // Store certificate data
        certificateData[tokenId] = CertificateData({
            certificateId: certData.certificateId,
            studentName: certData.studentName,
            studentAddress: to,
            courseName: certData.courseName,
            courseId: certData.courseId,
            issuerName: certData.issuerName,
            issuerAddress: certData.issuerAddress,
            completionDate: certData.completionDate,
            issueDate: certData.issueDate,
            expiryDate: certData.expiryDate,
            grade: certData.grade,
            creditHours: certData.creditHours,
            certificateType: certData.certificateType,
            skills: certData.skills,
            isVerified: false,
            verifiedBy: address(0),
            verifiedAt: 0,
            isRevoked: false,
            revokedBy: address(0),
            revokedAt: 0,
            revocationReason: ""
        });
        
        // Update mappings
        certificateHashToTokenId[certHash] = tokenId;
        studentCertificates[to].push(tokenId);
        issuerCertificates[certData.issuerAddress].push(tokenId);
        
        if (bytes(certData.courseId).length > 0) {
            courseCertificates[certData.courseId].push(tokenId);
        }
        
        // Mint the NFT
        _safeMint(to, tokenId);
        
        emit CertificateMinted(tokenId, to, certData.courseName, certData.issuerAddress, block.timestamp);
        
        return tokenId;
    }
    
    // ========== VERIFICATION FUNCTIONS ==========
    
    /**
     * @dev Verify a certificate
     * @param tokenId ID of the certificate token
     * @notice Only addresses with VERIFIER_ROLE can call this function
     */
    function verifyCertificate(uint256 tokenId) external onlyRole(VERIFIER_ROLE) validCertificate(tokenId) {
        require(!certificateData[tokenId].isVerified, "Certificate is already verified");
        
        certificateData[tokenId].isVerified = true;
        certificateData[tokenId].verifiedBy = msg.sender;
        certificateData[tokenId].verifiedAt = block.timestamp;
        
        emit CertificateVerified(tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Revoke a certificate
     * @param tokenId ID of the certificate token
     * @param reason Reason for revocation
     * @notice Only addresses with VERIFIER_ROLE can call this function
     */
    function revokeCertificate(uint256 tokenId, string calldata reason) 
        external 
        onlyRole(VERIFIER_ROLE) 
        validCertificate(tokenId) 
    {
        require(bytes(reason).length > 0, "Revocation reason cannot be empty");
        
        certificateData[tokenId].isRevoked = true;
        certificateData[tokenId].revokedBy = msg.sender;
        certificateData[tokenId].revokedAt = block.timestamp;
        certificateData[tokenId].revocationReason = reason;
        
        emit CertificateRevoked(tokenId, msg.sender, reason, block.timestamp);
    }
    
    // ========== UPDATE FUNCTIONS ==========
    
    /**
     * @dev Update certificate metadata URI
     * @param tokenId ID of the certificate token
     * @param newURI New metadata URI
     * @notice Only the issuer or admin can call this function
     */
    function updateCertificateURI(uint256 tokenId, string calldata newURI) 
        external 
        validCertificate(tokenId) 
    {
        require(
            certificateData[tokenId].issuerAddress == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized to update this certificate"
        );
        
        _setTokenURI(tokenId, newURI);
        emit CertificateUpdated(tokenId, msg.sender, block.timestamp);
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get certificate data
     * @param tokenId ID of the certificate token
     * @return Certificate data struct
     */
    function getCertificateData(uint256 tokenId) external view returns (CertificateData memory) {
        require(_exists(tokenId), "Certificate does not exist");
        return certificateData[tokenId];
    }
    
    /**
     * @dev Get all certificates for a student
     * @param student Address of the student
     * @return Array of certificate token IDs
     */
    function getStudentCertificates(address student) external view returns (uint256[] memory) {
        return studentCertificates[student];
    }
    
    /**
     * @dev Get all certificates issued by an institution
     * @param issuer Address of the issuing institution
     * @return Array of certificate token IDs
     */
    function getIssuerCertificates(address issuer) external view returns (uint256[] memory) {
        return issuerCertificates[issuer];
    }
    
    /**
     * @dev Get all certificates for a specific course
     * @param courseId ID of the course
     * @return Array of certificate token IDs
     */
    function getCourseCertificates(string calldata courseId) external view returns (uint256[] memory) {
        return courseCertificates[courseId];
    }
    
    /**
     * @dev Verify certificate authenticity using hash
     * @param certificateId Certificate ID
     * @param studentName Student name
     * @param courseName Course name
     * @param issuerAddress Issuer address
     * @param completionDate Completion date
     * @param issueDate Issue date
     * @return tokenId Token ID if certificate exists, 0 otherwise
     * @return isValid Whether the certificate is valid and not revoked
     */
    function verifyCertificateAuthenticity(
        string calldata certificateId,
        string calldata studentName,
        string calldata courseName,
        address issuerAddress,
        uint256 completionDate,
        uint256 issueDate
    ) external view returns (uint256 tokenId, bool isValid) {
        bytes32 certHash = keccak256(abi.encodePacked(
            certificateId,
            studentName,
            courseName,
            issuerAddress,
            completionDate,
            issueDate
        ));
        
        tokenId = certificateHashToTokenId[certHash];
        if (tokenId == 0) {
            return (0, false);
        }
        
        CertificateData memory cert = certificateData[tokenId];
        isValid = cert.isVerified && !cert.isRevoked;
        
        return (tokenId, isValid);
    }
    
    /**
     * @dev Check if a certificate is valid
     * @param tokenId ID of the certificate token
     * @return isValid Whether the certificate is valid
     * @return isExpired Whether the certificate has expired
     * @return isRevoked Whether the certificate has been revoked
     */
    function isCertificateValid(uint256 tokenId) external view returns (bool isValid, bool isExpired, bool isRevoked) {
        require(_exists(tokenId), "Certificate does not exist");
        
        CertificateData memory cert = certificateData[tokenId];
        isRevoked = cert.isRevoked;
        
        if (cert.expiryDate > 0) {
            isExpired = block.timestamp > cert.expiryDate;
        } else {
            isExpired = false;
        }
        
        isValid = cert.isVerified && !isRevoked && !isExpired;
        
        return (isValid, isExpired, isRevoked);
    }
    
    /**
     * @dev Get certificate statistics
     * @return totalCertificates Total number of certificates minted
     * @return verifiedCertificates Number of verified certificates
     * @return revokedCertificates Number of revoked certificates
     */
    function getCertificateStats() external view returns (
        uint256 totalCertificates,
        uint256 verifiedCertificates,
        uint256 revokedCertificates
    ) {
        totalCertificates = _tokenIdCounter.current();
        
        for (uint256 i = 1; i <= totalCertificates; i++) {
            if (certificateData[i].isVerified) {
                verifiedCertificates++;
            }
            if (certificateData[i].isRevoked) {
                revokedCertificates++;
            }
        }
        
        return (totalCertificates, verifiedCertificates, revokedCertificates);
    }
    
    // ========== OVERRIDE FUNCTIONS ==========
    
    /**
     * @dev Override _baseURI to return the base token URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Override tokenURI to return the token URI
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Override supportsInterface to support AccessControl
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
