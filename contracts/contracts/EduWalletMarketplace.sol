// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title EduWalletMarketplace
 * @dev Marketplace contract for exchanging EDU tokens for rewards and services
 * @notice This contract manages the token economy and reward exchange system
 */
contract EduWalletMarketplace is Ownable, AccessControl, ReentrancyGuard {
    
    using SafeERC20 for IERC20;
    
    // ========== STATE VARIABLES ==========
    
    /// @notice Role identifier for administrators who can manage the marketplace
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    /// @notice Role identifier for merchants who can add products
    bytes32 public constant MERCHANT_ROLE = keccak256("MERCHANT_ROLE");
    
    /// @notice Address of the EDU Token contract
    address public eduTokenAddress;
    
    /// @notice Address of the EduWallet Factory contract
    address public factoryAddress;
    
    /// @notice Marketplace fee percentage (in basis points, e.g., 250 = 2.5%)
    uint256 public marketplaceFee = 250; // 2.5%
    
    /// @notice Maximum marketplace fee (in basis points)
    uint256 public constant MAX_MARKETPLACE_FEE = 1000; // 10%
    
    /// @notice Address to receive marketplace fees
    address public feeRecipient;
    
    /// @notice Mapping from product ID to product data
    mapping(uint256 => Product) public products;
    
    /// @notice Mapping from category to array of product IDs
    mapping(string => uint256[]) public categoryProducts;
    
    /// @notice Array of all product IDs
    uint256[] public allProductIds;
    
    /// @notice Counter for product IDs
    uint256 private _productIdCounter;
    
    /// @notice Mapping from user address to array of purchase IDs
    mapping(address => uint256[]) public userPurchases;
    
    /// @notice Mapping from purchase ID to purchase data
    mapping(uint256 => Purchase) public purchases;
    
    /// @notice Counter for purchase IDs
    uint256 private _purchaseIdCounter;
    
    /// @notice Marketplace statistics
    MarketplaceStats public marketplaceStats;
    
    // ========== STRUCTS ==========
    
    /**
     * @dev Structure to store product information
     * @param productId Unique product identifier
     * @param name Name of the product
     * @param description Description of the product
     * @param category Category of the product
     * @param price Price in EDU tokens (in wei)
     * @param stockQuantity Available stock quantity
     * @param merchant Address of the merchant
     * @param isActive Whether the product is active
     * @param isDigital Whether the product is digital
     * @param deliveryInfo Delivery information for physical products
     * @param createdAt Timestamp when the product was created
     * @param updatedAt Timestamp when the product was last updated
     */
    struct Product {
        uint256 productId;
        string name;
        string description;
        string category;
        uint256 price;
        uint256 stockQuantity;
        address merchant;
        bool isActive;
        bool isDigital;
        string deliveryInfo;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    /**
     * @dev Structure to store purchase information
     * @param purchaseId Unique purchase identifier
     * @param buyer Address of the buyer
     * @param productId ID of the purchased product
     * @param quantity Quantity purchased
     * @param totalPrice Total price paid in EDU tokens
     * @param feeAmount Marketplace fee amount
     * @param status Purchase status
     * @param purchaseDate Timestamp when the purchase was made
     * @param deliveryDate Timestamp when the product was delivered (0 if not delivered)
     * @param deliveryAddress Delivery address for physical products
     * @param trackingNumber Tracking number for delivery
     */
    struct Purchase {
        uint256 purchaseId;
        address buyer;
        uint256 productId;
        uint256 quantity;
        uint256 totalPrice;
        uint256 feeAmount;
        PurchaseStatus status;
        uint256 purchaseDate;
        uint256 deliveryDate;
        string deliveryAddress;
        string trackingNumber;
    }
    
    /**
     * @dev Enum for purchase status
     */
    enum PurchaseStatus {
        Pending,        // Purchase made, awaiting processing
        Confirmed,      // Purchase confirmed by merchant
        Shipped,        // Product shipped (for physical products)
        Delivered,      // Product delivered
        Cancelled,      // Purchase cancelled
        Refunded        // Purchase refunded
    }
    
    /**
     * @dev Structure to store marketplace statistics
     * @param totalProducts Total number of products
     * @param activeProducts Number of active products
     * @param totalPurchases Total number of purchases
     * @param totalVolume Total volume in EDU tokens
     * @param totalFees Total fees collected
     */
    struct MarketplaceStats {
        uint256 totalProducts;
        uint256 activeProducts;
        uint256 totalPurchases;
        uint256 totalVolume;
        uint256 totalFees;
    }
    
    // ========== EVENTS ==========
    
    /**
     * @dev Emitted when a new product is added
     * @param productId ID of the added product
     * @param name Name of the product
     * @param category Category of the product
     * @param price Price in EDU tokens
     * @param merchant Address of the merchant
     * @param timestamp When the product was added
     */
    event ProductAdded(
        uint256 indexed productId,
        string name,
        string category,
        uint256 price,
        address indexed merchant,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when a product is updated
     * @param productId ID of the updated product
     * @param updatedBy Address that updated the product
     * @param timestamp When the update occurred
     */
    event ProductUpdated(uint256 indexed productId, address indexed updatedBy, uint256 timestamp);
    
    /**
     * @dev Emitted when a product is deactivated
     * @param productId ID of the deactivated product
     * @param deactivatedBy Address that deactivated the product
     * @param timestamp When the deactivation occurred
     */
    event ProductDeactivated(uint256 indexed productId, address indexed deactivatedBy, uint256 timestamp);
    
    /**
     * @dev Emitted when a purchase is made
     * @param purchaseId ID of the purchase
     * @param buyer Address of the buyer
     * @param productId ID of the purchased product
     * @param quantity Quantity purchased
     * @param totalPrice Total price paid
     * @param timestamp When the purchase was made
     */
    event PurchaseMade(
        uint256 indexed purchaseId,
        address indexed buyer,
        uint256 indexed productId,
        uint256 quantity,
        uint256 totalPrice,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when a purchase status is updated
     * @param purchaseId ID of the purchase
     * @param oldStatus Previous status
     * @param newStatus New status
     * @param updatedBy Address that updated the status
     * @param timestamp When the update occurred
     */
    event PurchaseStatusUpdated(
        uint256 indexed purchaseId,
        PurchaseStatus oldStatus,
        PurchaseStatus newStatus,
        address indexed updatedBy,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when marketplace fee is updated
     * @param oldFee Previous fee percentage
     * @param newFee New fee percentage
     * @param updatedBy Address that updated the fee
     * @param timestamp When the update occurred
     */
    event MarketplaceFeeUpdated(uint256 oldFee, uint256 newFee, address indexed updatedBy, uint256 timestamp);
    
    // ========== CONSTRUCTOR ==========
    
    /**
     * @dev Constructor to initialize the marketplace
     * @param initialOwner Address that will be the initial owner and admin
     * @param _eduToken Address of the EDU Token contract
     * @param _factory Address of the EduWallet Factory contract
     */
    constructor(address initialOwner, address _eduToken, address _factory) Ownable(initialOwner) {
        require(_eduToken != address(0), "Invalid EDU Token address");
        require(_factory != address(0), "Invalid Factory address");
        
        eduTokenAddress = _eduToken;
        factoryAddress = _factory;
        feeRecipient = initialOwner;
        
        // Grant roles to the initial owner
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(ADMIN_ROLE, initialOwner);
        _grantRole(MERCHANT_ROLE, initialOwner);
        
        // Initialize marketplace statistics
        marketplaceStats = MarketplaceStats({
            totalProducts: 0,
            activeProducts: 0,
            totalPurchases: 0,
            totalVolume: 0,
            totalFees: 0
        });
    }
    
    // ========== MODIFIERS ==========
    
    /**
     * @dev Modifier to ensure only merchants can manage their products
     * @param productId ID of the product
     */
    modifier onlyProductMerchant(uint256 productId) {
        require(products[productId].merchant == msg.sender, "Not the product merchant");
        _;
    }
    
    /**
     * @dev Modifier to ensure product exists and is active
     * @param productId ID of the product
     */
    modifier validProduct(uint256 productId) {
        require(products[productId].productId != 0, "Product does not exist");
        require(products[productId].isActive, "Product is not active");
        _;
    }
    
    // ========== PRODUCT MANAGEMENT ==========
    
    /**
     * @dev Add a new product to the marketplace
     * @param name Name of the product
     * @param description Description of the product
     * @param category Category of the product
     * @param price Price in EDU tokens (in wei)
     * @param stockQuantity Available stock quantity
     * @param isDigital Whether the product is digital
     * @param deliveryInfo Delivery information for physical products
     * @return productId ID of the added product
     * @notice Only addresses with MERCHANT_ROLE can call this function
     */
    function addProduct(
        string calldata name,
        string calldata description,
        string calldata category,
        uint256 price,
        uint256 stockQuantity,
        bool isDigital,
        string calldata deliveryInfo
    ) external onlyRole(MERCHANT_ROLE) returns (uint256) {
        require(bytes(name).length > 0, "Product name cannot be empty");
        require(bytes(description).length > 0, "Product description cannot be empty");
        require(bytes(category).length > 0, "Product category cannot be empty");
        require(price > 0, "Product price must be greater than zero");
        require(stockQuantity > 0, "Stock quantity must be greater than zero");
        
        _productIdCounter++;
        uint256 productId = _productIdCounter;
        
        products[productId] = Product({
            productId: productId,
            name: name,
            description: description,
            category: category,
            price: price,
            stockQuantity: stockQuantity,
            merchant: msg.sender,
            isActive: true,
            isDigital: isDigital,
            deliveryInfo: deliveryInfo,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        categoryProducts[category].push(productId);
        allProductIds.push(productId);
        
        marketplaceStats.totalProducts++;
        marketplaceStats.activeProducts++;
        
        emit ProductAdded(productId, name, category, price, msg.sender, block.timestamp);
        
        return productId;
    }
    
    /**
     * @dev Update product information
     * @param productId ID of the product to update
     * @param name New name of the product
     * @param description New description of the product
     * @param price New price in EDU tokens
     * @param stockQuantity New stock quantity
     * @param deliveryInfo New delivery information
     * @notice Only the product merchant can call this function
     */
    function updateProduct(
        uint256 productId,
        string calldata name,
        string calldata description,
        uint256 price,
        uint256 stockQuantity,
        string calldata deliveryInfo
    ) external onlyProductMerchant(productId) {
        require(bytes(name).length > 0, "Product name cannot be empty");
        require(bytes(description).length > 0, "Product description cannot be empty");
        require(price > 0, "Product price must be greater than zero");
        
        Product storage product = products[productId];
        product.name = name;
        product.description = description;
        product.price = price;
        product.stockQuantity = stockQuantity;
        product.deliveryInfo = deliveryInfo;
        product.updatedAt = block.timestamp;
        
        emit ProductUpdated(productId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Deactivate a product
     * @param productId ID of the product to deactivate
     * @notice Only the product merchant or admin can call this function
     */
    function deactivateProduct(uint256 productId) external {
        require(
            products[productId].merchant == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized to deactivate this product"
        );
        require(products[productId].isActive, "Product is already inactive");
        
        products[productId].isActive = false;
        marketplaceStats.activeProducts--;
        
        emit ProductDeactivated(productId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Reactivate a product
     * @param productId ID of the product to reactivate
     * @notice Only the product merchant or admin can call this function
     */
    function reactivateProduct(uint256 productId) external {
        require(
            products[productId].merchant == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized to reactivate this product"
        );
        require(!products[productId].isActive, "Product is already active");
        
        products[productId].isActive = true;
        marketplaceStats.activeProducts++;
        
        emit ProductUpdated(productId, msg.sender, block.timestamp);
    }
    
    // ========== PURCHASE FUNCTIONS ==========
    
    /**
     * @dev Purchase a product
     * @param productId ID of the product to purchase
     * @param quantity Quantity to purchase
     * @param deliveryAddress Delivery address (for physical products)
     * @return purchaseId ID of the purchase
     * @notice Requires sufficient EDU token balance and allowance
     */
    function purchaseProduct(
        uint256 productId,
        uint256 quantity,
        string calldata deliveryAddress
    ) external nonReentrant validProduct(productId) returns (uint256) {
        require(quantity > 0, "Quantity must be greater than zero");
        
        Product storage product = products[productId];
        require(product.stockQuantity >= quantity, "Insufficient stock");
        
        uint256 totalPrice = product.price * quantity;
        uint256 feeAmount = (totalPrice * marketplaceFee) / 10000;
        uint256 merchantAmount = totalPrice - feeAmount;
        
        // Check buyer's EDU token balance and allowance
        IERC20 eduToken = IERC20(eduTokenAddress);
        require(eduToken.balanceOf(msg.sender) >= totalPrice, "Insufficient EDU token balance");
        require(eduToken.allowance(msg.sender, address(this)) >= totalPrice, "Insufficient EDU token allowance");
        
        // Transfer EDU tokens
        eduToken.safeTransferFrom(msg.sender, address(this), totalPrice);
        
        // Distribute payment
        if (feeAmount > 0) {
            eduToken.safeTransfer(feeRecipient, feeAmount);
        }
        eduToken.safeTransfer(product.merchant, merchantAmount);
        
        // Update product stock
        product.stockQuantity -= quantity;
        product.updatedAt = block.timestamp;
        
        // Create purchase record
        _purchaseIdCounter++;
        uint256 purchaseId = _purchaseIdCounter;
        
        purchases[purchaseId] = Purchase({
            purchaseId: purchaseId,
            buyer: msg.sender,
            productId: productId,
            quantity: quantity,
            totalPrice: totalPrice,
            feeAmount: feeAmount,
            status: PurchaseStatus.Pending,
            purchaseDate: block.timestamp,
            deliveryDate: 0,
            deliveryAddress: deliveryAddress,
            trackingNumber: ""
        });
        
        userPurchases[msg.sender].push(purchaseId);
        
        // Update statistics
        marketplaceStats.totalPurchases++;
        marketplaceStats.totalVolume += totalPrice;
        marketplaceStats.totalFees += feeAmount;
        
        emit PurchaseMade(purchaseId, msg.sender, productId, quantity, totalPrice, block.timestamp);
        
        return purchaseId;
    }
    
    // ========== PURCHASE MANAGEMENT ==========
    
    /**
     * @dev Update purchase status
     * @param purchaseId ID of the purchase
     * @param newStatus New status
     * @param trackingNumber Tracking number (for shipped status)
     * @notice Only the product merchant or admin can call this function
     */
    function updatePurchaseStatus(
        uint256 purchaseId,
        PurchaseStatus newStatus,
        string calldata trackingNumber
    ) external {
        require(purchases[purchaseId].purchaseId != 0, "Purchase does not exist");
        
        uint256 productId = purchases[purchaseId].productId;
        require(
            products[productId].merchant == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized to update this purchase"
        );
        
        Purchase storage purchase = purchases[purchaseId];
        PurchaseStatus oldStatus = purchase.status;
        
        require(oldStatus != PurchaseStatus.Cancelled && oldStatus != PurchaseStatus.Refunded, 
                "Cannot update cancelled or refunded purchase");
        
        purchase.status = newStatus;
        
        if (newStatus == PurchaseStatus.Shipped) {
            purchase.trackingNumber = trackingNumber;
        } else if (newStatus == PurchaseStatus.Delivered) {
            purchase.deliveryDate = block.timestamp;
        }
        
        emit PurchaseStatusUpdated(purchaseId, oldStatus, newStatus, msg.sender, block.timestamp);
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @dev Update marketplace fee
     * @param newFee New fee percentage (in basis points)
     * @notice Only admin can call this function
     */
    function updateMarketplaceFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        require(newFee <= MAX_MARKETPLACE_FEE, "Fee exceeds maximum allowed");
        
        uint256 oldFee = marketplaceFee;
        marketplaceFee = newFee;
        
        emit MarketplaceFeeUpdated(oldFee, newFee, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Update fee recipient address
     * @param newRecipient New fee recipient address
     * @notice Only admin can call this function
     */
    function updateFeeRecipient(address newRecipient) external onlyRole(ADMIN_ROLE) {
        require(newRecipient != address(0), "Invalid fee recipient address");
        feeRecipient = newRecipient;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get product information
     * @param productId ID of the product
     * @return Product data struct
     */
    function getProduct(uint256 productId) external view returns (Product memory) {
        require(products[productId].productId != 0, "Product does not exist");
        return products[productId];
    }
    
    /**
     * @dev Get all product IDs
     * @return Array of all product IDs
     */
    function getAllProductIds() external view returns (uint256[] memory) {
        return allProductIds;
    }
    
    /**
     * @dev Get products by category
     * @param category Category name
     * @return Array of product IDs in the category
     */
    function getProductsByCategory(string calldata category) external view returns (uint256[] memory) {
        return categoryProducts[category];
    }
    
    /**
     * @dev Get purchase information
     * @param purchaseId ID of the purchase
     * @return Purchase data struct
     */
    function getPurchase(uint256 purchaseId) external view returns (Purchase memory) {
        require(purchases[purchaseId].purchaseId != 0, "Purchase does not exist");
        return purchases[purchaseId];
    }
    
    /**
     * @dev Get user's purchases
     * @param user Address of the user
     * @return Array of purchase IDs
     */
    function getUserPurchases(address user) external view returns (uint256[] memory) {
        return userPurchases[user];
    }
    
    /**
     * @dev Get marketplace statistics
     * @return Marketplace statistics struct
     */
    function getMarketplaceStats() external view returns (MarketplaceStats memory) {
        return marketplaceStats;
    }
    
    /**
     * @dev Get contract addresses
     * @return eduToken Address of EDU Token contract
     * @return factory Address of Factory contract
     */
    function getContractAddresses() external view returns (address eduToken, address factory) {
        return (eduTokenAddress, factoryAddress);
    }
    
    // ========== OVERRIDE FUNCTIONS ==========
    
    /**
     * @dev Override supportsInterface to support AccessControl
     */
    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
