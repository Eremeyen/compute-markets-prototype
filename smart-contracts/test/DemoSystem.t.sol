// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test, console } from 'forge-std/Test.sol';
import { H100Oracle } from '../src/H100Oracle.sol';
import { MockUSDC } from '../src/MockUSDC.sol';

contract DemoSystemTest is Test {
	H100Oracle public oracle;
	MockUSDC public mockUSDC;

	address public deployer;
	address public user1;
	address public user2;

	function setUp() public {
		deployer = makeAddr('deployer');
		user1 = makeAddr('user1');
		user2 = makeAddr('user2');

		vm.startPrank(deployer);

		// Deploy contracts
		mockUSDC = new MockUSDC(deployer);
		oracle = new H100Oracle(deployer);

		// Mint initial USDC
		mockUSDC.mint(deployer, 100000 * 10 ** 6); // 100,000 USDC

		// Set initial price
		uint256 initialPrice = 250 * 10 ** 16; // $2.50
		oracle.updatePrice(initialPrice, block.timestamp, H100Oracle.PriceSource.Manual);

		vm.stopPrank();
	}

	function test_InitialSetup() public view {
		// Check MockUSDC setup
		assertEq(mockUSDC.owner(), deployer);
		assertEq(mockUSDC.name(), 'USD Coin');
		assertEq(mockUSDC.symbol(), 'USDC');
		assertEq(mockUSDC.decimals(), 6);
		assertEq(mockUSDC.balanceOf(deployer), 100000 * 10 ** 6);

		// Check H100Oracle setup
		assertEq(oracle.owner(), deployer);
		assertTrue(oracle.isTrustedUpdater(deployer));
		assertEq(oracle.currentPrice(), 250 * 10 ** 16); // $2.50
	}

	function test_MockUSDC_Minting() public {
		vm.startPrank(deployer);

		// Test single mint
		mockUSDC.mint(user1, 5000 * 10 ** 6); // 5000 USDC
		assertEq(mockUSDC.balanceOf(user1), 5000 * 10 ** 6);

		// Test batch mint
		address[] memory recipients = new address[](2);
		uint256[] memory amounts = new uint256[](2);
		recipients[0] = user1;
		recipients[1] = user2;
		amounts[0] = 1000 * 10 ** 6; // 1000 USDC
		amounts[1] = 2000 * 10 ** 6; // 2000 USDC

		mockUSDC.mintBatch(recipients, amounts);
		assertEq(mockUSDC.balanceOf(user1), 6000 * 10 ** 6);
		assertEq(mockUSDC.balanceOf(user2), 2000 * 10 ** 6);

		vm.stopPrank();
	}

	function test_MockUSDC_DemoMint() public {
		vm.startPrank(user1);

		// Test demo mint function
		mockUSDC.mintDemoAmount();
		assertEq(mockUSDC.balanceOf(user1), 1000 * 10 ** 6);

		vm.stopPrank();
	}

	function test_MockUSDC_Transfer() public {
		// Give user1 some USDC
		vm.prank(deployer);
		mockUSDC.mint(user1, 5000 * 10 ** 6);

		// Test transfer
		vm.startPrank(user1);
		mockUSDC.transfer(user2, 2000 * 10 ** 6);
		assertEq(mockUSDC.balanceOf(user1), 3000 * 10 ** 6);
		assertEq(mockUSDC.balanceOf(user2), 2000 * 10 ** 6);
		vm.stopPrank();
	}

	function test_MockUSDC_ApproveAndTransferFrom() public {
		// Give user1 some USDC
		vm.prank(deployer);
		mockUSDC.mint(user1, 5000 * 10 ** 6);

		// User1 approves user2 to spend 2000 USDC
		vm.prank(user1);
		mockUSDC.approve(user2, 2000 * 10 ** 6);

		// User2 transfers from user1
		vm.prank(user2);
		mockUSDC.transferFrom(user1, user2, 1500 * 10 ** 6);

		assertEq(mockUSDC.balanceOf(user1), 3500 * 10 ** 6);
		assertEq(mockUSDC.balanceOf(user2), 1500 * 10 ** 6);
		assertEq(mockUSDC.allowance(user1, user2), 500 * 10 ** 6);
	}

	function test_H100Oracle_PriceUpdates() public {
		vm.startPrank(deployer);

		// Warp time forward to ensure timestamp is newer
		vm.warp(block.timestamp + 1);

		// Update price
		uint256 newPrice = 300 * 10 ** 16; // $3.00
		oracle.updatePrice(newPrice, block.timestamp, H100Oracle.PriceSource.VastAI);

		assertEq(oracle.currentPrice(), newPrice);

		// Check metadata
		(uint256 price, uint256 timestamp, H100Oracle.PriceSource source) = oracle
			.latestPriceWithMeta();
		assertEq(price, newPrice);
		assertEq(timestamp, block.timestamp);
		assertEq(uint256(source), uint256(H100Oracle.PriceSource.VastAI));

		vm.stopPrank();
	}

	function test_H100Oracle_AccessControl() public {
		// Only owner or trusted updater can update prices
		vm.startPrank(user1);

		vm.expectRevert(H100Oracle.NotAuthorized.selector);
		oracle.updatePrice(100 * 10 ** 16, block.timestamp, H100Oracle.PriceSource.Manual);

		vm.stopPrank();

		// Add user1 as trusted updater
		vm.prank(deployer);
		oracle.addTrustedUpdater(user1);

		// Now user1 can update prices
		vm.startPrank(user1);
		vm.warp(block.timestamp + 1); // Ensure timestamp is newer
		oracle.updatePrice(100 * 10 ** 16, block.timestamp, H100Oracle.PriceSource.Manual);
		assertEq(oracle.currentPrice(), 100 * 10 ** 16);
		vm.stopPrank();
	}

	function test_H100Oracle_StalePrice() public {
		// First set a current price with a fresh timestamp
		vm.startPrank(deployer);
		vm.warp(block.timestamp + 1);
		oracle.updatePrice(100 * 10 ** 16, block.timestamp, H100Oracle.PriceSource.Manual);
		vm.stopPrank();

		// Warp time forward to make the price stale (more than 2 hours)
		vm.warp(block.timestamp + 3 hours);

		// Should revert when trying to get latest price
		vm.expectRevert(H100Oracle.StaleOracle.selector);
		oracle.latestPrice();
	}

	function test_Integration_PriceAndUSDC() public {
		// Simulate a real-world scenario
		vm.startPrank(deployer);

		// Warp time forward to ensure timestamp is newer
		vm.warp(block.timestamp + 1);

		// Update H100 price to $2.75
		oracle.updatePrice(275 * 10 ** 16, block.timestamp, H100Oracle.PriceSource.Combined);

		// Mint USDC to users
		mockUSDC.mint(user1, 10000 * 10 ** 6); // 10,000 USDC
		mockUSDC.mint(user2, 5000 * 10 ** 6); // 5,000 USDC

		vm.stopPrank();

		// Verify setup
		assertEq(oracle.currentPrice(), 275 * 10 ** 16); // $2.75
		assertEq(mockUSDC.balanceOf(user1), 10000 * 10 ** 6);
		assertEq(mockUSDC.balanceOf(user2), 5000 * 10 ** 6);

		// Simulate a purchase (e.g., 10 H100 hours at $2.75 each = $27.50)
		uint256 h100Hours = 10;
		uint256 pricePerHour = oracle.currentPrice();
		uint256 totalCost = (h100Hours * pricePerHour) / 10 ** 18; // Convert from 1e18 to 1e6

		vm.startPrank(user1);
		mockUSDC.transfer(user2, totalCost * 10 ** 6); // Transfer in USDC (6 decimals)
		vm.stopPrank();

		// Verify balances after "purchase"
		assertEq(mockUSDC.balanceOf(user1), 10000 * 10 ** 6 - totalCost * 10 ** 6);
		assertEq(mockUSDC.balanceOf(user2), 5000 * 10 ** 6 + totalCost * 10 ** 6);
	}

	function test_MockUSDC_NonOwnerCannotMint() public {
		vm.startPrank(user1);

		vm.expectRevert();
		mockUSDC.mint(user2, 1000 * 10 ** 6);

		vm.stopPrank();
	}

	function test_MockUSDC_Burn() public {
		// Give user1 some USDC
		vm.prank(deployer);
		mockUSDC.mint(user1, 5000 * 10 ** 6);

		// Burn some USDC
		vm.prank(deployer);
		mockUSDC.burn(user1, 2000 * 10 ** 6);

		assertEq(mockUSDC.balanceOf(user1), 3000 * 10 ** 6);
	}
}
