// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/**
 * @title NEXUS Token
 * @dev World Nexus Platform Token - ERC20 with minting, burning, and governance
 */
contract NEXUS is
    ERC20,
    ERC20Burnable,
    ERC20Snapshot,
    Ownable,
    ERC20Permit,
    ERC20Votes
{
    // Role-based access control
    mapping(address => bool) public minters;
    
    // Platform fee configuration
    uint256 public platformFeePercentage = 100; // 1% = 100 basis points
    address public platformFeeRecipient;

    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event PlatformFeeUpdated(uint256 newFeePercentage);
    event PlatformFeeRecipientUpdated(address indexed newRecipient);

    /**
     * @dev Initialize NEXUS token
     * @param initialSupply Initial token supply (in wei)
     * @param feeRecipient Address to receive platform fees
     */
    constructor(
        uint256 initialSupply,
        address feeRecipient
    ) ERC20("NEXUS Token", "NEXUS") ERC20Permit("NEXUS Token") {
        require(feeRecipient != address(0), "Invalid fee recipient");
        
        platformFeeRecipient = feeRecipient;
        minters[msg.sender] = true;
        
        // Mint initial supply to contract owner
        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Snapshot the current state of account balances
     * Only callable by owner
     */
    function snapshot() public onlyOwner {
        _snapshot();
    }

    /**
     * @dev Mint new tokens
     * Only callable by authorized minters
     */
    function mint(address to, uint256 amount) public {
        require(minters[msg.sender], "Not authorized to mint");
        _mint(to, amount);
    }

    /**
     * @dev Mint to specific address (alternative name for compatibility)
     */
    function mintTo(address to, uint256 amount) public {
        mint(to, amount);
    }

    /**
     * @dev Add a minter role
     */
    function addMinter(address minter) public onlyOwner {
        require(minter != address(0), "Invalid minter address");
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    /**
     * @dev Remove a minter role
     */
    function removeMinter(address minter) public onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @dev Set platform fee percentage (basis points, e.g., 100 = 1%)
     */
    function setPlatformFeeInfo(uint256 feePercentage) public onlyOwner {
        require(feePercentage <= 10000, "Fee too high"); // Max 100%
        platformFeePercentage = feePercentage;
        emit PlatformFeeUpdated(feePercentage);
    }

    /**
     * @dev Get platform fee information
     */
    function getPlatformFeeInfo()
        public
        view
        returns (uint256 feePercentage, address feeRecipient)
    {
        return (platformFeePercentage, platformFeeRecipient);
    }

    /**
     * @dev Update platform fee recipient
     */
    function setPlatformFeeRecipient(address newRecipient) public onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        platformFeeRecipient = newRecipient;
        emit PlatformFeeRecipientUpdated(newRecipient);
    }

    /**
     * @dev Calculate platform fee for a given amount
     */
    function calculatePlatformFee(uint256 amount)
        public
        view
        returns (uint256)
    {
        return (amount * platformFeePercentage) / 10000;
    }

    // Internal functions for ERC20 extensions

    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Snapshot, ERC20Votes) {
        super._update(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
