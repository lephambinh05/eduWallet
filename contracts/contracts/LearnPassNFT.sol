// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { ERC721Burnable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Counters } from "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title LearnPassNFT
 * @dev NFT contract for Educational Learning Passports
 * @notice Each LearnPass NFT represents a student's digital learning identity and achievements
 */
contract LearnPassNFT is ERC721, ERC721URIStorage, ERC721Burnable, AccessControl {
    
    using Counters for Counters.Counter;
    
    // ========== STATE VARIABLES ==========
    
    /// @notice Counter for token IDs
    Counters.Counter private _tokenIdCounter;
    
    /// @notice Role identifier for minters who can create new LearnPass NFTs
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    /// @notice Role identifier for updaters who can update LearnPass metadata
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");
    
    /// @notice Base URI for token metadata
    string private _baseTokenURI;
    
    /// @notice Mapping from token ID to LearnPass metadata
    mapping(uint256 => LearnPassData) public learnPassData;
    
    /// @notice Mapping from student address to their LearnPass token ID
    mapping(address => uint256) public studentToTokenId;
    
    /// @notice Mapping from token ID to array of course completions
    mapping(uint256 => CourseCompletion[]) public courseCompletions;
    
    /// @notice Mapping from token ID to array of badges earned
    mapping(uint256 => Badge[]) public badges;
    
    /// @notice Mapping from token ID to total credit hours
    mapping(uint256 => uint256) public totalCreditHours;
    
    // ========== STRUCTS ==========
    
    /**
     * @dev Structure to store LearnPass metadata
     * @param studentName Full name of the student
     * @param studentId Unique student identifier
     * @param institutionName Name of the issuing institution
     * @param institutionAddress Address of the issuing institution
     * @param dateOfBirth Date of birth (timestamp)
     * @param enrollmentDate Date of enrollment (timestamp)
     * @param graduationDate Date of graduation (timestamp, 0 if not graduated)
     * @param gpa Grade Point Average (scaled by 100, e.g., 350 = 3.50)
     * @param major Field of study/major
     * @param degreeType Type of degree (Bachelor, Master, PhD, etc.)
     * @param isActive Whether the LearnPass is currently active
     * @param createdAt Timestamp when the LearnPass was created
     * @param lastUpdated Timestamp when the LearnPass was last updated
     */
    struct LearnPassData {
        string studentName;
        string studentId;
        string institutionName;
        address institutionAddress;
        uint256 dateOfBirth;
        uint256 enrollmentDate;
        uint256 graduationDate;
        uint256 gpa; // Scaled by 100 (350 = 3.50)
        string major;
        string degreeType;
        bool isActive;
        uint256 createdAt;
        uint256 lastUpdated;
    }
    
    /**
     * @dev Structure to store course completion information
     * @param courseId Unique course identifier
     * @param courseName Name of the course
     * @param creditHours Number of credit hours
     * @param grade Grade received (scaled by 100)
     * @param completionDate Date of completion (timestamp)
     * @param instructorName Name of the instructor
     * @param institutionAddress Address of the institution
     */
    struct CourseCompletion {
        string courseId;
        string courseName;
        uint256 creditHours;
        uint256 grade; // Scaled by 100 (850 = 85%)
        uint256 completionDate;
        string instructorName;
        address institutionAddress;
    }
    
    /**
     * @dev Structure to store badge information
     * @param badgeId Unique badge identifier
     * @param badgeName Name of the badge
     * @param badgeDescription Description of the badge
     * @param badgeType Type of badge (achievement, skill, participation, etc.)
     * @param earnedDate Date when the badge was earned (timestamp)
     * @param issuerAddress Address of the badge issuer
     * @param metadataURI URI to badge metadata
     */
    struct Badge {
        string badgeId;
        string badgeName;
        string badgeDescription;
        string badgeType;
        uint256 earnedDate;
        address issuerAddress;
        string metadataURI;
    }
    
    // ========== EVENTS ==========
    
    /**
     * @dev Emitted when a new LearnPass NFT is minted
     * @param tokenId ID of the minted token
     * @param student Address of the student
     * @param studentName Name of the student
     * @param institutionAddress Address of the issuing institution
     * @param timestamp When the LearnPass was created
     */
    event LearnPassMinted(
        uint256 indexed tokenId,
        address indexed student,
        string studentName,
        address indexed institutionAddress,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when LearnPass data is updated
     * @param tokenId ID of the updated token
     * @param updatedBy Address that updated the data
     * @param timestamp When the update occurred
     */
    event LearnPassUpdated(uint256 indexed tokenId, address indexed updatedBy, uint256 timestamp);
    
    /**
     * @dev Emitted when a course completion is added
     * @param tokenId ID of the LearnPass token
     * @param courseId ID of the completed course
     * @param courseName Name of the course
     * @param grade Grade received
     * @param timestamp When the course was completed
     */
    event CourseCompleted(
        uint256 indexed tokenId,
        string indexed courseId,
        string courseName,
        uint256 grade,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when a badge is earned
     * @param tokenId ID of the LearnPass token
     * @param badgeId ID of the earned badge
     * @param badgeName Name of the badge
     * @param issuerAddress Address of the badge issuer
     * @param timestamp When the badge was earned
     */
    event BadgeEarned(
        uint256 indexed tokenId,
        string indexed badgeId,
        string badgeName,
        address indexed issuerAddress,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when GPA is updated
     * @param tokenId ID of the LearnPass token
     * @param oldGPA Previous GPA value
     * @param newGPA New GPA value
     * @param updatedBy Address that updated the GPA
     * @param timestamp When the GPA was updated
     */
    event GPAUpdated(
        uint256 indexed tokenId,
        uint256 oldGPA,
        uint256 newGPA,
        address indexed updatedBy,
        uint256 timestamp
    );
    
    // ========== CONSTRUCTOR ==========
    
    /**
     * @dev Constructor to initialize the LearnPass NFT contract
     * @param initialOwner Address that will be the initial owner and admin
     * @param baseTokenURI Base URI for token metadata
     */
    constructor(address initialOwner, string memory baseTokenURI) 
        ERC721("EduWallet LearnPass", "LEARNPASS") 
        Ownable(initialOwner) 
    {
        _baseTokenURI = baseTokenURI;
        
        // Grant roles to the initial owner
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(MINTER_ROLE, initialOwner);
        _grantRole(UPDATER_ROLE, initialOwner);
    }
    
    // ========== MODIFIERS ==========
    
    /**
     * @dev Modifier to ensure only the token owner or authorized updater can modify data
     * @param tokenId ID of the token to check
     */
    modifier onlyTokenOwnerOrUpdater(uint256 tokenId) {
        require(
            ownerOf(tokenId) == msg.sender || hasRole(UPDATER_ROLE, msg.sender),
            "Not authorized to update this LearnPass"
        );
        _;
    }
    
    // ========== MINTING FUNCTIONS ==========
    
    /**
     * @dev Mint a new LearnPass NFT for a student
     * @param to Address of the student
     * @param studentData Initial student data
     * @return tokenId ID of the minted token
     * @notice Only addresses with MINTER_ROLE can call this function
     * @notice Each student can only have one LearnPass NFT
     */
    function mintLearnPass(address to, LearnPassData calldata studentData) 
        external 
        onlyRole(MINTER_ROLE) 
        returns (uint256) 
    {
        require(to != address(0), "Cannot mint to zero address");
        require(studentToTokenId[to] == 0, "Student already has a LearnPass");
        require(bytes(studentData.studentName).length > 0, "Student name cannot be empty");
        require(bytes(studentData.studentId).length > 0, "Student ID cannot be empty");
        require(studentData.institutionAddress != address(0), "Invalid institution address");
        require(studentData.enrollmentDate > 0, "Invalid enrollment date");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        // Store LearnPass data
        learnPassData[tokenId] = LearnPassData({
            studentName: studentData.studentName,
            studentId: studentData.studentId,
            institutionName: studentData.institutionName,
            institutionAddress: studentData.institutionAddress,
            dateOfBirth: studentData.dateOfBirth,
            enrollmentDate: studentData.enrollmentDate,
            graduationDate: studentData.graduationDate,
            gpa: studentData.gpa,
            major: studentData.major,
            degreeType: studentData.degreeType,
            isActive: true,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        // Map student address to token ID
        studentToTokenId[to] = tokenId;
        
        // Mint the NFT
        _safeMint(to, tokenId);
        
        emit LearnPassMinted(tokenId, to, studentData.studentName, studentData.institutionAddress, block.timestamp);
        
        return tokenId;
    }
    
    // ========== UPDATE FUNCTIONS ==========
    
    /**
     * @dev Update LearnPass basic information
     * @param tokenId ID of the LearnPass token
     * @param newStudentName New student name
     * @param newMajor New major/field of study
     * @param newDegreeType New degree type
     * @notice Only token owner or authorized updater can call this function
     */
    function updateLearnPassInfo(
        uint256 tokenId,
        string calldata newStudentName,
        string calldata newMajor,
        string calldata newDegreeType
    ) external onlyTokenOwnerOrUpdater(tokenId) {
        require(_exists(tokenId), "Token does not exist");
        require(bytes(newStudentName).length > 0, "Student name cannot be empty");
        
        LearnPassData storage data = learnPassData[tokenId];
        data.studentName = newStudentName;
        data.major = newMajor;
        data.degreeType = newDegreeType;
        data.lastUpdated = block.timestamp;
        
        emit LearnPassUpdated(tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Update GPA
     * @param tokenId ID of the LearnPass token
     * @param newGPA New GPA value (scaled by 100)
     * @notice Only authorized updater can call this function
     */
    function updateGPA(uint256 tokenId, uint256 newGPA) external onlyRole(UPDATER_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        require(newGPA <= 400, "GPA cannot exceed 4.00");
        
        LearnPassData storage data = learnPassData[tokenId];
        uint256 oldGPA = data.gpa;
        data.gpa = newGPA;
        data.lastUpdated = block.timestamp;
        
        emit GPAUpdated(tokenId, oldGPA, newGPA, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Set graduation date
     * @param tokenId ID of the LearnPass token
     * @param graduationDate Date of graduation (timestamp)
     * @notice Only authorized updater can call this function
     */
    function setGraduationDate(uint256 tokenId, uint256 graduationDate) external onlyRole(UPDATER_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        require(graduationDate > 0, "Invalid graduation date");
        
        LearnPassData storage data = learnPassData[tokenId];
        data.graduationDate = graduationDate;
        data.lastUpdated = block.timestamp;
        
        emit LearnPassUpdated(tokenId, msg.sender, block.timestamp);
    }
    
    // ========== COURSE COMPLETION FUNCTIONS ==========
    
    /**
     * @dev Add a course completion to the LearnPass
     * @param tokenId ID of the LearnPass token
     * @param courseData Course completion data
     * @notice Only authorized updater can call this function
     */
    function addCourseCompletion(uint256 tokenId, CourseCompletion calldata courseData) 
        external 
        onlyRole(UPDATER_ROLE) 
    {
        require(_exists(tokenId), "Token does not exist");
        require(bytes(courseData.courseId).length > 0, "Course ID cannot be empty");
        require(courseData.creditHours > 0, "Credit hours must be greater than zero");
        require(courseData.grade <= 10000, "Grade cannot exceed 100.00%");
        
        courseCompletions[tokenId].push(courseData);
        totalCreditHours[tokenId] += courseData.creditHours;
        
        // Update GPA based on new course completion
        _updateGPAFromCourses(tokenId);
        
        emit CourseCompleted(tokenId, courseData.courseId, courseData.courseName, courseData.grade, block.timestamp);
    }
    
    /**
     * @dev Internal function to update GPA based on all course completions
     * @param tokenId ID of the LearnPass token
     */
    function _updateGPAFromCourses(uint256 tokenId) internal {
        CourseCompletion[] storage courses = courseCompletions[tokenId];
        if (courses.length == 0) return;
        
        uint256 totalWeightedGrade = 0;
        uint256 totalCredits = 0;
        
        for (uint256 i = 0; i < courses.length; i++) {
            totalWeightedGrade += (courses[i].grade * courses[i].creditHours);
            totalCredits += courses[i].creditHours;
        }
        
        if (totalCredits > 0) {
            uint256 newGPA = (totalWeightedGrade / totalCredits) * 4 / 100; // Convert to 4.0 scale
            learnPassData[tokenId].gpa = newGPA;
        }
    }
    
    // ========== BADGE FUNCTIONS ==========
    
    /**
     * @dev Add a badge to the LearnPass
     * @param tokenId ID of the LearnPass token
     * @param badgeData Badge data
     * @notice Only authorized updater can call this function
     */
    function addBadge(uint256 tokenId, Badge calldata badgeData) external onlyRole(UPDATER_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        require(bytes(badgeData.badgeId).length > 0, "Badge ID cannot be empty");
        require(badgeData.issuerAddress != address(0), "Invalid issuer address");
        
        badges[tokenId].push(badgeData);
        
        emit BadgeEarned(tokenId, badgeData.badgeId, badgeData.badgeName, badgeData.issuerAddress, block.timestamp);
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get LearnPass data
     * @param tokenId ID of the LearnPass token
     * @return LearnPass data struct
     */
    function getLearnPassData(uint256 tokenId) external view returns (LearnPassData memory) {
        require(_exists(tokenId), "Token does not exist");
        return learnPassData[tokenId];
    }
    
    /**
     * @dev Get all course completions for a LearnPass
     * @param tokenId ID of the LearnPass token
     * @return Array of course completions
     */
    function getCourseCompletions(uint256 tokenId) external view returns (CourseCompletion[] memory) {
        require(_exists(tokenId), "Token does not exist");
        return courseCompletions[tokenId];
    }
    
    /**
     * @dev Get all badges for a LearnPass
     * @param tokenId ID of the LearnPass token
     * @return Array of badges
     */
    function getBadges(uint256 tokenId) external view returns (Badge[] memory) {
        require(_exists(tokenId), "Token does not exist");
        return badges[tokenId];
    }
    
    /**
     * @dev Get total credit hours for a LearnPass
     * @param tokenId ID of the LearnPass token
     * @return Total credit hours
     */
    function getTotalCreditHours(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return totalCreditHours[tokenId];
    }
    
    /**
     * @dev Get token ID for a student address
     * @param student Address of the student
     * @return Token ID (0 if no LearnPass exists)
     */
    function getTokenIdByStudent(address student) external view returns (uint256) {
        return studentToTokenId[student];
    }
    
    /**
     * @dev Check if a student has a LearnPass
     * @param student Address of the student
     * @return True if the student has a LearnPass
     */
    function hasLearnPass(address student) external view returns (bool) {
        return studentToTokenId[student] != 0;
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
