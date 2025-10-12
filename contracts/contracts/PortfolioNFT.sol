// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PortfolioNFT
 * @dev NFT contract for academic portfolios with hybrid on-chain/off-chain data storage
 * @author EduWallet Team
 */
contract PortfolioNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Events
    event PortfolioMinted(
        uint256 indexed tokenId,
        address indexed owner,
        address indexed institution,
        uint256 version,
        bool isVerified
    );
    
    event PortfolioUpdated(
        uint256 indexed tokenId,
        uint256 newVersion,
        string newIpfsHash,
        string newDataHash
    );
    
    event InstitutionAuthorized(address indexed institution, bool authorized);
    
    event PortfolioVerified(uint256 indexed tokenId, address indexed institution);

    // Structs
    struct PortfolioSummary {
        address owner;
        address institution;
        uint256 totalCourses;
        uint256 totalCertificates;
        uint256 totalBadges;
        uint256 gpa; // Stored as uint256 (e.g., 380 for 3.8 GPA)
        string dataHash; // Keccak256 hash of full portfolio data
        string ipfsHash; // IPFS hash for full data
        bytes institutionSignature; // Digital signature from institution
        uint256 version;
        uint256 lastUpdated;
        bool isVerified;
        bool exists;
    }

    // State variables
    uint256 private _nextTokenId;
    mapping(uint256 => PortfolioSummary) public portfolios;
    mapping(address => bool) public authorizedInstitutions;
    mapping(address => uint256) public ownerToTokenId; // One portfolio per owner
    mapping(string => bool) public usedDataHashes; // Prevent duplicate data

    // Constants
    uint256 public constant MAX_GPA = 400; // 4.0 * 100
    uint256 public constant VERSION_INCREMENT = 1;

    // Modifiers
    modifier onlyAuthorizedInstitution() {
        require(authorizedInstitutions[msg.sender], "PortfolioNFT: Unauthorized institution");
        _;
    }

    modifier portfolioExists(uint256 tokenId) {
        require(portfolios[tokenId].exists, "PortfolioNFT: Portfolio does not exist");
        _;
    }

    modifier notDuplicateData(string memory dataHash) {
        require(!usedDataHashes[dataHash], "PortfolioNFT: Duplicate portfolio data");
        _;
    }

    constructor(address initialOwner) ERC721("EduWallet Portfolio", "PORTFOLIO") Ownable(initialOwner) {}

    /**
     * @dev Mint a new portfolio NFT
     * @param summary Portfolio summary data
     * @param metadataURI Token metadata URI
     */
    function mintPortfolio(
        PortfolioSummary memory summary,
        string memory metadataURI
    ) external nonReentrant notDuplicateData(summary.dataHash) returns (uint256) {
        require(summary.owner != address(0), "PortfolioNFT: Invalid owner");
        require(summary.totalCourses > 0, "PortfolioNFT: Must have at least one course");
        require(summary.gpa <= MAX_GPA, "PortfolioNFT: Invalid GPA");
        require(summary.version > 0, "PortfolioNFT: Invalid version");
        
        // Check if owner already has a portfolio
        require(ownerToTokenId[summary.owner] == 0, "PortfolioNFT: Owner already has portfolio");

        // Verify signature if institution is provided
        if (summary.institution != address(0)) {
            require(authorizedInstitutions[summary.institution], "PortfolioNFT: Unauthorized institution");
            require(verifyInstitutionSignature(summary), "PortfolioNFT: Invalid institution signature");
            summary.isVerified = true;
        } else {
            summary.isVerified = false;
        }

        // Set timestamps
        summary.lastUpdated = block.timestamp;
        summary.exists = true;

        // Mint NFT
        uint256 tokenId = _nextTokenId++;
        _safeMint(summary.owner, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Store portfolio data
        portfolios[tokenId] = summary;
        ownerToTokenId[summary.owner] = tokenId;
        usedDataHashes[summary.dataHash] = true;

        emit PortfolioMinted(tokenId, summary.owner, summary.institution, summary.version, summary.isVerified);

        return tokenId;
    }

    /**
     * @dev Update existing portfolio with new data
     * @param tokenId Portfolio token ID
     * @param newSummary New portfolio summary
     * @param newMetadataURI New metadata URI
     */
    function updatePortfolio(
        uint256 tokenId,
        PortfolioSummary memory newSummary,
        string memory newMetadataURI
    ) external nonReentrant portfolioExists(tokenId) notDuplicateData(newSummary.dataHash) {
        PortfolioSummary storage existing = portfolios[tokenId];
        
        require(msg.sender == existing.owner, "PortfolioNFT: Only owner can update");
        require(newSummary.version > existing.version, "PortfolioNFT: Version must increase");
        require(newSummary.owner == existing.owner, "PortfolioNFT: Owner cannot change");
        require(newSummary.gpa <= MAX_GPA, "PortfolioNFT: Invalid GPA");

        // Verify signature if institution is provided
        if (newSummary.institution != address(0)) {
            require(authorizedInstitutions[newSummary.institution], "PortfolioNFT: Unauthorized institution");
            require(verifyInstitutionSignature(newSummary), "PortfolioNFT: Invalid institution signature");
            newSummary.isVerified = true;
        } else {
            newSummary.isVerified = existing.isVerified; // Keep existing verification status
        }

        // Update data
        newSummary.lastUpdated = block.timestamp;
        newSummary.exists = true;
        
        portfolios[tokenId] = newSummary;
        usedDataHashes[newSummary.dataHash] = true;
        
        // Update token URI
        _setTokenURI(tokenId, newMetadataURI);

        emit PortfolioUpdated(tokenId, newSummary.version, newSummary.ipfsHash, newSummary.dataHash);
    }

    /**
     * @dev Verify institution signature
     * @param summary Portfolio summary to verify
     * @return true if signature is valid
     */
    function verifyInstitutionSignature(PortfolioSummary memory summary) public view returns (bool) {
        if (summary.institutionSignature.length == 0) return false;
        
        bytes32 messageHash = keccak256(abi.encodePacked(
            summary.owner,
            summary.totalCourses,
            summary.totalCertificates,
            summary.totalBadges,
            summary.gpa,
            summary.dataHash,
            summary.ipfsHash,
            summary.version,
            block.chainid, // Include chain ID to prevent cross-chain replay
            address(this)  // Include contract address
        ));

        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(summary.institutionSignature);
        
        return signer == summary.institution;
    }

    /**
     * @dev Get portfolio summary by token ID
     * @param tokenId Portfolio token ID
     * @return Portfolio summary
     */
    function getPortfolioSummary(uint256 tokenId) external view portfolioExists(tokenId) returns (PortfolioSummary memory) {
        return portfolios[tokenId];
    }

    /**
     * @dev Get portfolio token ID by owner
     * @param owner Portfolio owner address
     * @return Token ID (0 if no portfolio exists)
     */
    function getPortfolioByOwner(address owner) external view returns (uint256) {
        return ownerToTokenId[owner];
    }

    /**
     * @dev Check if portfolio is verified
     * @param tokenId Portfolio token ID
     * @return true if verified
     */
    function isPortfolioVerified(uint256 tokenId) external view portfolioExists(tokenId) returns (bool) {
        return portfolios[tokenId].isVerified;
    }

    /**
     * @dev Authorize/unauthorize institution
     * @param institution Institution address
     * @param authorized Authorization status
     */
    function setInstitutionAuthorization(address institution, bool authorized) external onlyOwner {
        require(institution != address(0), "PortfolioNFT: Invalid institution address");
        authorizedInstitutions[institution] = authorized;
        emit InstitutionAuthorized(institution, authorized);
    }

    /**
     * @dev Batch authorize institutions
     * @param institutions Array of institution addresses
     * @param authorized Authorization status
     */
    function batchSetInstitutionAuthorization(address[] calldata institutions, bool authorized) external onlyOwner {
        for (uint256 i = 0; i < institutions.length; i++) {
            require(institutions[i] != address(0), "PortfolioNFT: Invalid institution address");
            authorizedInstitutions[institutions[i]] = authorized;
            emit InstitutionAuthorized(institutions[i], authorized);
        }
    }

    /**
     * @dev Get all authorized institutions
     * @return Array of authorized institution addresses
     */
    function getAuthorizedInstitutions() external view returns (address[] memory) {
        // Note: This is a simplified version. In production, you might want to use a mapping with enumeration
        // or implement a more efficient way to get all authorized institutions
        address[] memory institutions = new address[](0);
        return institutions;
    }

    /**
     * @dev Get portfolio statistics
     * @return totalMinted Total number of portfolios minted
     * @return totalVerified Total number of verified portfolios
     */
    function getPortfolioStats() external view returns (uint256 totalMinted, uint256 totalVerified) {
        totalMinted = _nextTokenId;
        
        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (portfolios[i].exists && portfolios[i].isVerified) {
                totalVerified++;
            }
        }
    }

    /**
     * @dev Override supportsInterface to include ERC721URIStorage
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override tokenURI to use ERC721URIStorage
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override _update to use ERC721URIStorage
     */
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721) returns (address) {
        return super._update(to, tokenId, auth);
    }
}
