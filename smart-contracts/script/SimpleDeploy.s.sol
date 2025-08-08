// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console } from 'forge-std/Script.sol';
import { H100Oracle } from '../src/H100Oracle.sol';
import { MockUSDC } from '../src/MockUSDC.sol';

contract SimpleDeployScript is Script {
	H100Oracle public oracle;
	MockUSDC public mockUSDC;

	function setUp() public {}

	function run() public {
		address deployer = vm.addr(vm.envUint('PRIVATE_KEY'));
		console.log('Deploying Demo System with deployer:', deployer);

		vm.startBroadcast(deployer);

		// Deploy the MockUSDC contract first
		mockUSDC = new MockUSDC(deployer);
		console.log('MockUSDC deployed at:', address(mockUSDC));

		// Deploy the H100Oracle contract
		oracle = new H100Oracle(deployer);
		console.log('H100Oracle deployed at:', address(oracle));

		// Mint initial USDC for demo purposes
		// Mint 100,000 USDC to the deployer
		mockUSDC.mint(deployer, 100000 * 10 ** 6); // 100,000 USDC

		// Set an initial price for the oracle (e.g., $2.50 per H100 SXM GPU-hour)
		uint256 initialPrice = 250 * 10 ** 16; // $2.50 in 1e18 format
		oracle.updatePrice(initialPrice, block.timestamp, H100Oracle.PriceSource.Manual);

		vm.stopBroadcast();

		// Log deployment information
		console.log('');
		console.log('=== DEPLOYMENT SUMMARY ===');
		console.log('Deployer address:', deployer);
		console.log('MockUSDC address:', address(mockUSDC));
		console.log('H100Oracle address:', address(oracle));
		console.log('Initial USDC balance:', mockUSDC.balanceOf(deployer), 'USDC');
		console.log('Initial H100 price:', oracle.currentPrice(), 'wei ($2.50)');
		console.log('');

		// Verify the deployment
		require(mockUSDC.owner() == deployer, 'MockUSDC owner not set correctly');
		require(oracle.owner() == deployer, 'Oracle owner not set correctly');
		require(oracle.isTrustedUpdater(deployer), 'Deployer not set as trusted updater');
		require(mockUSDC.balanceOf(deployer) == 100000 * 10 ** 6, 'Initial USDC mint failed');

		console.log('Demo system deployment successful!');
		console.log('');
		console.log('=== BACKEND CONFIG UPDATE ===');
		console.log('Update backend/src/config/config.ts with:');
		console.log("export const ORACLE_ADDRESS: `0x${string}` | '' = '", address(oracle), "';");
		console.log("export const USDC_ADDRESS: `0x${string}` | '' = '", address(mockUSDC), "';");
		console.log('=== END BACKEND CONFIG UPDATE ===');
	}
}
