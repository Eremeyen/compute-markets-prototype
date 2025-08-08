// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Script } from 'forge-std/Script.sol';
import { MockUSDC } from '../src/MockUSDC.sol';
import { H100Oracle } from '../src/H100Oracle.sol';
import { ForwardEscrow } from '../src/ForwardEscrow.sol';

contract DeployMinimalScript is Script {
	MockUSDC public mockUSDC;
	H100Oracle public oracle;
	ForwardEscrow public forwardEscrow;

	function setUp() public {}

	function run() public {
		// Use the first unlocked account (0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
		address deployer = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

		vm.startBroadcast(deployer);

		// Deploy MockUSDC
		mockUSDC = new MockUSDC(deployer);

		// Deploy H100Oracle
		oracle = new H100Oracle(deployer);

		// Deploy ForwardEscrow
		forwardEscrow = new ForwardEscrow(address(oracle), address(mockUSDC));

		// Mint initial USDC for demo purposes
		mockUSDC.mint(deployer, 100000 * 10 ** 6); // 100,000 USDC

		// Set initial price for the oracle
		uint256 initialPrice = 250 * 10 ** 16; // $2.50 in 1e18 format
		oracle.updatePrice(initialPrice, block.timestamp, H100Oracle.PriceSource.Manual);

		vm.stopBroadcast();

		// Verify the deployment
		require(mockUSDC.owner() == deployer, 'MockUSDC owner not set correctly');
		require(oracle.owner() == deployer, 'Oracle owner not set correctly');
		require(oracle.isTrustedUpdater(deployer), 'Deployer not set as trusted updater');
		require(mockUSDC.balanceOf(deployer) == 100000 * 10 ** 6, 'Initial USDC mint failed');
	}
}
