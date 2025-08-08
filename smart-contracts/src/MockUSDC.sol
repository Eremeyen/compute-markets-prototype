// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC20 } from 'lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol';
import { Ownable } from 'lib/openzeppelin-contracts/contracts/access/Ownable.sol';

/**
 * @title MockUSDC
 * @dev Mock USDC contract for demo and testing purposes
 * This contract behaves like the real USDC but is controlled by the deployer
 * for easy minting and management during demos
 */
contract MockUSDC is ERC20, Ownable {
	uint8 private constant _DECIMALS = 6;

	constructor(address initialOwner) ERC20('USD Coin', 'USDC') Ownable(initialOwner) {}

	/**
	 * @dev Returns the number of decimals used to get its user representation.
	 */
	function decimals() public view virtual override returns (uint8) {
		return _DECIMALS;
	}

	/**
	 * @dev Mint tokens to a specific address (owner only)
	 * @param to The address to mint tokens to
	 * @param amount The amount of tokens to mint
	 */
	function mint(address to, uint256 amount) external onlyOwner {
		_mint(to, amount);
	}

	/**
	 * @dev Mint tokens to multiple addresses (owner only)
	 * @param recipients Array of addresses to mint tokens to
	 * @param amounts Array of amounts to mint to each address
	 */
	function mintBatch(
		address[] calldata recipients,
		uint256[] calldata amounts
	) external onlyOwner {
		require(recipients.length == amounts.length, 'Arrays length mismatch');
		for (uint256 i = 0; i < recipients.length; i++) {
			_mint(recipients[i], amounts[i]);
		}
	}

	/**
	 * @dev Burn tokens from a specific address (owner only)
	 * @param from The address to burn tokens from
	 * @param amount The amount of tokens to burn
	 */
	function burn(address from, uint256 amount) external onlyOwner {
		_burn(from, amount);
	}

	/**
	 * @dev Convenience function to mint 1000 USDC to the caller
	 * Useful for demo purposes
	 */
	function mintDemoAmount() external {
		_mint(msg.sender, 1000 * 10 ** 6); // 1000 USDC
	}
}
