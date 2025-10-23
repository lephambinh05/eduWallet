// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PortfolioNFT
 * @dev NFT contract để mint Portfolio (chứa chứng chỉ, bảng điểm, GPA)
 */
contract PortfolioNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Struct chứa metadata của Portfolio NFT
    struct PortfolioMetadata {
        string studentName;
        string studentId;
        string email;
        string institution;
        uint256 gpa; // GPA * 100 (ví dụ: 3.75 = 375)
        uint256 mintDate;
        string ipfsHash; // Hash của toàn bộ dữ liệu trên IPFS
        bool verified;
    }

    // Mapping từ tokenId đến metadata
    mapping(uint256 => PortfolioMetadata) public portfolioData;

    // Mapping để check một địa chỉ đã mint bao nhiêu NFT
    mapping(address => uint256[]) public ownerTokens;

    // Events
    event PortfolioMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string studentName,
        string ipfsHash,
        uint256 mintDate
    );

    event PortfolioVerified(uint256 indexed tokenId, bool verified);

    constructor() ERC721("EduWallet Portfolio", "EDUNFT") Ownable(msg.sender) {}

    /**
     * @dev Mint Portfolio NFT
     * @param to Địa chỉ nhận NFT
     * @param studentName Tên sinh viên
     * @param studentId Mã sinh viên
     * @param email Email
     * @param institution Trường học
     * @param gpa GPA (nhân 100)
     * @param ipfsHash IPFS hash chứa dữ liệu đầy đủ
     * @param metadataURI URI metadata (IPFS link)
     */
    function mintPortfolio(
        address to,
        string memory studentName,
        string memory studentId,
        string memory email,
        string memory institution,
        uint256 gpa,
        string memory ipfsHash,
        string memory metadataURI
    ) public returns (uint256) {
        require(bytes(studentName).length > 0, "Student name required");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(gpa <= 400, "Invalid GPA"); // Max 4.00

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Lưu metadata
        portfolioData[tokenId] = PortfolioMetadata({
            studentName: studentName,
            studentId: studentId,
            email: email,
            institution: institution,
            gpa: gpa,
            mintDate: block.timestamp,
            ipfsHash: ipfsHash,
            verified: false
        });

        // Track owner tokens
        ownerTokens[to].push(tokenId);

        emit PortfolioMinted(tokenId, to, studentName, ipfsHash, block.timestamp);

        return tokenId;
    }

    /**
     * @dev Xác minh Portfolio NFT (chỉ owner/admin)
     */
    function verifyPortfolio(uint256 tokenId, bool verified) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        portfolioData[tokenId].verified = verified;
        emit PortfolioVerified(tokenId, verified);
    }

    /**
     * @dev Lấy danh sách token IDs của một owner
     */
    function getOwnerTokens(address owner) public view returns (uint256[] memory) {
        return ownerTokens[owner];
    }

    /**
     * @dev Lấy thông tin Portfolio
     */
    function getPortfolioInfo(uint256 tokenId) public view returns (
        string memory studentName,
        string memory studentId,
        string memory email,
        string memory institution,
        uint256 gpa,
        uint256 mintDate,
        string memory ipfsHash,
        bool verified
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        PortfolioMetadata memory data = portfolioData[tokenId];
        return (
            data.studentName,
            data.studentId,
            data.email,
            data.institution,
            data.gpa,
            data.mintDate,
            data.ipfsHash,
            data.verified
        );
    }

    /**
     * @dev Get total minted tokens
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    // Override functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
