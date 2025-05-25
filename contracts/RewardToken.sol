// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardToken is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        _mint(initialOwner, initialSupply);
    }
    
    // 铸造新代币（仅限所有者）
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    // 销毁代币
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
} 