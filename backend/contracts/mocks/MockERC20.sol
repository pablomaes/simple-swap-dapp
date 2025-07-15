// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// This is a mock contract for testing purposes
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    // Function to mint tokens to any address, only for testing
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

/// @notice A simple faucet to get test tokens for this dApp.
/// @dev Mints 100 tokens to the caller's address. For testing purposes only.
function faucet() external {
    // We use 10**decimals() to be compatible with any ERC20 token,
    // regardless of its decimal precision.
    _mint(msg.sender, 100 * 10**decimals());
}
}