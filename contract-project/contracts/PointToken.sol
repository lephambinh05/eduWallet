// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PointToken is ERC20, Ownable {
    // Exchange rate: 0.1 PZO = 10 Points
    uint256 public constant EXCHANGE_RATE = 100; // 1 PZO = 1000 Points, 0.1 PZO = 100 Points
    uint256 public constant PZO_DECIMALS = 18;
    uint256 public constant POINT_DECIMALS = 18;
    
    // PZO Token contract address
    address public pzoToken;
    
    // Events
    event PointsExchanged(address indexed user, uint256 pzoAmount, uint256 pointAmount);
    event PointsWithdrawn(address indexed user, uint256 pointAmount, uint256 pzoAmount);
    
    constructor(address _pzoToken) ERC20("EduWallet Points", "POINT") Ownable(msg.sender) {
        pzoToken = _pzoToken;
    }
    
    // Function to exchange PZO to Points
    function exchangePZOToPoints(uint256 pzoAmount) public {
        require(pzoAmount > 0, "PZO amount must be greater than 0");
        
        // Calculate points to receive (0.1 PZO = 10 Points)
        uint256 pointAmount = (pzoAmount * 100) / (10**PZO_DECIMALS); // 0.1 PZO = 100 Points
        
        // Transfer PZO tokens from user to this contract
        IERC20(pzoToken).transferFrom(msg.sender, address(this), pzoAmount);
        
        // Mint points to user
        _mint(msg.sender, pointAmount * 10**POINT_DECIMALS);
        
        emit PointsExchanged(msg.sender, pzoAmount, pointAmount * 10**POINT_DECIMALS);
    }
    
    // Function to withdraw Points back to PZO (admin only)
    function withdrawPointsToPZO(uint256 pointAmount) public {
        require(pointAmount > 0, "Point amount must be greater than 0");
        require(balanceOf(msg.sender) >= pointAmount, "Insufficient points balance");
        
        // Calculate PZO to return
        uint256 pzoAmount = (pointAmount * 10**PZO_DECIMALS) / 100;
        
        // Burn points from user
        _burn(msg.sender, pointAmount);
        
        // Transfer PZO back to user
        IERC20(pzoToken).transfer(msg.sender, pzoAmount);
        
        emit PointsWithdrawn(msg.sender, pointAmount, pzoAmount);
    }
    
    // Function to get exchange rate info
    function getExchangeInfo() public view returns (uint256 rate, uint256 pzoDecimals, uint256 pointDecimals) {
        return (EXCHANGE_RATE, PZO_DECIMALS, POINT_DECIMALS);
    }
    
    // Function to calculate points from PZO amount
    function calculatePointsFromPZO(uint256 pzoAmount) public pure returns (uint256) {
        return (pzoAmount * 100) / (10**PZO_DECIMALS);
    }
    
    // Function to calculate PZO from points amount
    function calculatePZOFromPoints(uint256 pointAmount) public pure returns (uint256) {
        return (pointAmount * 10**PZO_DECIMALS) / 100;
    }
}

