// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EDUToken
 * @dev Educational Token (EDU) for EduWallet platform
 * @notice This token is used for rewards, marketplace transactions, and learning incentives
 */
contract EDUToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl {
    
    // ========== STATE VARIABLES ==========
    
    /// @notice Maximum total supply of EDU tokens (100 million tokens)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    /// @notice Role identifier for minters who can create new tokens
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    /// @notice Role identifier for pausers who can pause token transfers
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    /// @notice Mapping to track if an address is a verified educational institution
    mapping(address => bool) public verifiedInstitutions;
    
    /// @notice Mapping to track reward pools for different activities
    mapping(string => uint256) public rewardPools;
    
    // ========== EVENTS ==========
    
    /**
     * @dev Emitted when tokens are minted as rewards
     * @param to Address receiving the reward tokens
     * @param amount Amount of tokens minted
     * @param reason Reason for the reward (e.g., "course_completion", "badge_earned")
     * @param timestamp When the reward was given
     */
    event RewardMinted(address indexed to, uint256 amount, string reason, uint256 timestamp);
    
    /**
     * @dev Emitted when an institution is verified
     * @param institution Address of the verified institution
     * @param verifiedBy Address that verified the institution
     * @param timestamp When the verification occurred
     */
    event InstitutionVerified(address indexed institution, address indexed verifiedBy, uint256 timestamp);
    
    /**
     * @dev Emitted when an institution verification is revoked
     * @param institution Address of the institution
     * @param revokedBy Address that revoked the verification
     * @param timestamp When the verification was revoked
     */
    event InstitutionVerificationRevoked(address indexed institution, address indexed revokedBy, uint256 timestamp);
    
    /**
     * @dev Emitted when a reward pool is updated
     * @param poolName Name of the reward pool
     * @param oldAmount Previous amount in the pool
     * @param newAmount New amount in the pool
     * @param updatedBy Address that updated the pool
     */
    event RewardPoolUpdated(string indexed poolName, uint256 oldAmount, uint256 newAmount, address indexed updatedBy);
    
    // ========== CONSTRUCTOR ==========
    
    /**
     * @dev Constructor to initialize the EDU token
     * @param initialOwner Address that will be the initial owner and admin
     * @notice Initial supply is minted to the owner for distribution
     */
    constructor(address initialOwner) ERC20("EduWallet Token", "EDU") Ownable(initialOwner) {
        // Grant roles to the initial owner
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(MINTER_ROLE, initialOwner);
        _grantRole(PAUSER_ROLE, initialOwner);
        
        // Mint initial supply to the owner (10% of max supply for initial distribution)
        uint256 initialSupply = MAX_SUPPLY / 10;
        _mint(initialOwner, initialSupply);
        
        // Initialize reward pools
        rewardPools["course_completion"] = 1000 * 10**18; // 1000 EDU per course completion
        rewardPools["badge_earned"] = 500 * 10**18; // 500 EDU per badge
        rewardPools["certificate_issued"] = 2000 * 10**18; // 2000 EDU per certificate
        rewardPools["referral"] = 100 * 10**18; // 100 EDU per referral
    }
    
    // ========== MODIFIERS ==========
    
    /**
     * @dev Modifier to restrict access to verified institutions only
     */
    modifier onlyVerifiedInstitution() {
        require(verifiedInstitutions[msg.sender], "Only verified institutions can perform this action");
        _;
    }
    
    // ========== MINTING FUNCTIONS ==========
    
    /**
     * @dev Mint tokens as rewards for educational activities
     * @param to Address to receive the reward tokens
     * @param amount Amount of tokens to mint
     * @param reason Reason for the reward
     * @notice Only addresses with MINTER_ROLE can call this function
     * @notice Cannot exceed MAX_SUPPLY
     */
    function mintReward(address to, uint256 amount, string calldata reason) external onlyRole(MINTER_ROLE) {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than zero");
        require(totalSupply() + amount <= MAX_SUPPLY, "Minting would exceed max supply");
        require(bytes(reason).length > 0, "Reason cannot be empty");
        
        _mint(to, amount);
        emit RewardMinted(to, amount, reason, block.timestamp);
    }
    
    /**
     * @dev Mint tokens for course completion
     * @param student Address of the student
     * @param courseId Unique identifier of the completed course
     * @notice Only verified institutions can call this function
     */
    function mintCourseCompletionReward(address student, string calldata courseId) external onlyVerifiedInstitution {
        uint256 rewardAmount = rewardPools["course_completion"];
        require(rewardAmount > 0, "Course completion rewards are not available");
        require(totalSupply() + rewardAmount <= MAX_SUPPLY, "Minting would exceed max supply");
        
        _mint(student, rewardAmount);
        emit RewardMinted(student, rewardAmount, string(abi.encodePacked("course_completion_", courseId)), block.timestamp);
    }
    
    /**
     * @dev Mint tokens for badge earning
     * @param student Address of the student
     * @param badgeId Unique identifier of the earned badge
     * @notice Only verified institutions can call this function
     */
    function mintBadgeReward(address student, string calldata badgeId) external onlyVerifiedInstitution {
        uint256 rewardAmount = rewardPools["badge_earned"];
        require(rewardAmount > 0, "Badge rewards are not available");
        require(totalSupply() + rewardAmount <= MAX_SUPPLY, "Minting would exceed max supply");
        
        _mint(student, rewardAmount);
        emit RewardMinted(student, rewardAmount, string(abi.encodePacked("badge_earned_", badgeId)), block.timestamp);
    }
    
    /**
     * @dev Mint tokens for certificate issuance
     * @param student Address of the student
     * @param certificateId Unique identifier of the issued certificate
     * @notice Only verified institutions can call this function
     */
    function mintCertificateReward(address student, string calldata certificateId) external onlyVerifiedInstitution {
        uint256 rewardAmount = rewardPools["certificate_issued"];
        require(rewardAmount > 0, "Certificate rewards are not available");
        require(totalSupply() + rewardAmount <= MAX_SUPPLY, "Minting would exceed max supply");
        
        _mint(student, rewardAmount);
        emit RewardMinted(student, rewardAmount, string(abi.encodePacked("certificate_issued_", certificateId)), block.timestamp);
    }
    
    // ========== INSTITUTION MANAGEMENT ==========
    
    /**
     * @dev Verify an educational institution
     * @param institution Address of the institution to verify
     * @notice Only admin can call this function
     */
    function verifyInstitution(address institution) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(institution != address(0), "Invalid institution address");
        require(!verifiedInstitutions[institution], "Institution is already verified");
        
        verifiedInstitutions[institution] = true;
        emit InstitutionVerified(institution, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Revoke institution verification
     * @param institution Address of the institution
     * @notice Only admin can call this function
     */
    function revokeInstitutionVerification(address institution) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(verifiedInstitutions[institution], "Institution is not verified");
        
        verifiedInstitutions[institution] = false;
        emit InstitutionVerificationRevoked(institution, msg.sender, block.timestamp);
    }
    
    // ========== REWARD POOL MANAGEMENT ==========
    
    /**
     * @dev Update reward pool amount
     * @param poolName Name of the reward pool
     * @param newAmount New amount for the reward pool
     * @notice Only admin can call this function
     */
    function updateRewardPool(string calldata poolName, uint256 newAmount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(bytes(poolName).length > 0, "Pool name cannot be empty");
        
        uint256 oldAmount = rewardPools[poolName];
        rewardPools[poolName] = newAmount;
        
        emit RewardPoolUpdated(poolName, oldAmount, newAmount, msg.sender);
    }
    
    // ========== PAUSE FUNCTIONS ==========
    
    /**
     * @dev Pause token transfers
     * @notice Only addresses with PAUSER_ROLE can call this function
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     * @notice Only addresses with PAUSER_ROLE can call this function
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get remaining mintable tokens
     * @return Amount of tokens that can still be minted
     */
    function getRemainingMintable() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
    
    /**
     * @dev Get reward pool amount
     * @param poolName Name of the reward pool
     * @return Amount in the specified reward pool
     */
    function getRewardPoolAmount(string calldata poolName) external view returns (uint256) {
        return rewardPools[poolName];
    }
    
    /**
     * @dev Check if an address is a verified institution
     * @param institution Address to check
     * @return True if the address is a verified institution
     */
    function isVerifiedInstitution(address institution) external view returns (bool) {
        return verifiedInstitutions[institution];
    }
    
    // ========== OVERRIDE FUNCTIONS ==========
    
    /**
     * @dev Override _update to support pausable functionality
     */
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
    
    /**
     * @dev Override supportsInterface to support AccessControl
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
