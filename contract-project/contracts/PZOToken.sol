// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PZOToken is ERC20, Ownable {
    constructor() ERC20("Pione Zero Token", "PZO") Ownable(msg.sender) {
        // Mint 1,000,000 PZO tokens to deployer
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    // Function to mint new tokens (only owner)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    // Function to burn tokens
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}

