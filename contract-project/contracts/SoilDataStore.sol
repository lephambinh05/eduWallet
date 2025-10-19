// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EduWalletDataStore {
    // Struct để lưu trữ thông tin học tập
    struct LearningRecord {
        uint256 id;
        string studentName;
        string institution;
        string courseName;
        string certificateHash;
        uint256 completionDate;
        uint256 score;
        bool verified;
        address issuer;
        address student;
    }
    
    // Struct để lưu trữ badge/achievement
    struct Badge {
        uint256 id;
        string name;
        string description;
        string imageHash;
        uint256 earnedDate;
        address student;
        bool active;
    }
    
    // Struct để lưu trữ portfolio
    struct Portfolio {
        uint256 id;
        string title;
        string description;
        string projectHash;
        string[] skills;
        uint256 createdDate;
        address owner;
    }
    
    // Mappings để lưu trữ dữ liệu
    mapping(uint256 => LearningRecord) public learningRecords;
    mapping(uint256 => Badge) public badges;
    mapping(uint256 => Portfolio) public portfolios;
    
    // Mapping từ student address đến array of record IDs
    mapping(address => uint256[]) public studentRecords;
    mapping(address => uint256[]) public studentBadges;
    mapping(address => uint256[]) public studentPortfolios;
    
    // Biến đếm
    uint256 public recordCount;
    uint256 public badgeCount;
    uint256 public portfolioCount;
    
    // Mapping để kiểm tra quyền issuer
    mapping(address => bool) public authorizedIssuers;
    
    // Owner của contract
    address public owner;
    
    // Events
    event LearningRecordAdded(uint256 indexed id, string studentName, string courseName, address indexed student);
    event BadgeEarned(uint256 indexed id, string name, address indexed student);
    event PortfolioCreated(uint256 indexed id, string title, address indexed owner);
    event IssuerAuthorized(address indexed issuer, bool authorized);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner, "Not authorized issuer");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }
    
    // Hàm thêm học bạ mới (chỉ issuer được phép)
    function addLearningRecord(
        string memory _studentName,
        string memory _institution,
        string memory _courseName,
        string memory _certificateHash,
        uint256 _score,
        address _student
    ) public onlyAuthorizedIssuer {
        recordCount++;
        
        learningRecords[recordCount] = LearningRecord({
            id: recordCount,
            studentName: _studentName,
            institution: _institution,
            courseName: _courseName,
            certificateHash: _certificateHash,
            completionDate: block.timestamp,
            score: _score,
            verified: true,
            issuer: msg.sender,
            student: _student
        });
        
        studentRecords[_student].push(recordCount);
        
        emit LearningRecordAdded(recordCount, _studentName, _courseName, _student);
    }
    
    // Hàm tạo badge mới
    function earnBadge(
        string memory _name,
        string memory _description,
        string memory _imageHash,
        address _student
    ) public onlyAuthorizedIssuer {
        badgeCount++;
        
        badges[badgeCount] = Badge({
            id: badgeCount,
            name: _name,
            description: _description,
            imageHash: _imageHash,
            earnedDate: block.timestamp,
            student: _student,
            active: true
        });
        
        studentBadges[_student].push(badgeCount);
        
        emit BadgeEarned(badgeCount, _name, _student);
    }
    
    // Hàm tạo portfolio mới (sinh viên tự tạo)
    function createPortfolio(
        string memory _title,
        string memory _description,
        string memory _projectHash,
        string[] memory _skills
    ) public {
        portfolioCount++;
        
        portfolios[portfolioCount] = Portfolio({
            id: portfolioCount,
            title: _title,
            description: _description,
            projectHash: _projectHash,
            skills: _skills,
            createdDate: block.timestamp,
            owner: msg.sender
        });
        
        studentPortfolios[msg.sender].push(portfolioCount);
        
        emit PortfolioCreated(portfolioCount, _title, msg.sender);
    }
    
    // Hàm ủy quyền issuer mới
    function authorizeIssuer(address _issuer, bool _authorized) public onlyOwner {
        authorizedIssuers[_issuer] = _authorized;
        emit IssuerAuthorized(_issuer, _authorized);
    }
    
    // Hàm lấy thông tin học bạ
    function getLearningRecord(uint256 _id) public view returns (
        uint256 id,
        string memory studentName,
        string memory institution,
        string memory courseName,
        string memory certificateHash,
        uint256 completionDate,
        uint256 score,
        bool verified,
        address issuer,
        address student
    ) {
        require(_id > 0 && _id <= recordCount, "Invalid record ID");
        
        LearningRecord memory record = learningRecords[_id];
        return (
            record.id,
            record.studentName,
            record.institution,
            record.courseName,
            record.certificateHash,
            record.completionDate,
            record.score,
            record.verified,
            record.issuer,
            record.student
        );
    }
    
    // Hàm lấy thông tin badge
    function getBadge(uint256 _id) public view returns (
        uint256 id,
        string memory name,
        string memory description,
        string memory imageHash,
        uint256 earnedDate,
        address student,
        bool active
    ) {
        require(_id > 0 && _id <= badgeCount, "Invalid badge ID");
        
        Badge memory badge = badges[_id];
        return (
            badge.id,
            badge.name,
            badge.description,
            badge.imageHash,
            badge.earnedDate,
            badge.student,
            badge.active
        );
    }
    
    // Hàm lấy thông tin portfolio
    function getPortfolio(uint256 _id) public view returns (
        uint256 id,
        string memory title,
        string memory description,
        string memory projectHash,
        string[] memory skills,
        uint256 createdDate,
        address owner
    ) {
        require(_id > 0 && _id <= portfolioCount, "Invalid portfolio ID");
        
        Portfolio memory portfolio = portfolios[_id];
        return (
            portfolio.id,
            portfolio.title,
            portfolio.description,
            portfolio.projectHash,
            portfolio.skills,
            portfolio.createdDate,
            portfolio.owner
        );
    }
    
    // Hàm lấy danh sách học bạ của sinh viên
    function getStudentRecords(address _student) public view returns (uint256[] memory) {
        return studentRecords[_student];
    }
    
    // Hàm lấy danh sách badge của sinh viên
    function getStudentBadges(address _student) public view returns (uint256[] memory) {
        return studentBadges[_student];
    }
    
    // Hàm lấy danh sách portfolio của sinh viên
    function getStudentPortfolios(address _student) public view returns (uint256[] memory) {
        return studentPortfolios[_student];
    }
    
    // Hàm lấy tổng số
    function getCounts() public view returns (uint256 records, uint256 badges, uint256 portfolios) {
        return (recordCount, badgeCount, portfolioCount);
    }
}
