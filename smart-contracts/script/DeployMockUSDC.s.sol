// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console } from 'forge-std/Script.sol';
import { MockUSDC } from '../src/MockUSDC.sol';

contract DeployMockUSDCScript is Script {
	MockUSDC public mockUSDC;

	function setUp() public {}

	function run() public {
		// Get the deployer address
		address deployer = vm.addr(vm.envUint('PRIVATE_KEY'));
		console.log('Deploying MockUSDC with deployer:', deployer);

		// Start broadcasting transactions
		vm.startBroadcast();

		// Deploy the MockUSDC contract
		mockUSDC = new MockUSDC(deployer);

		// Mint some initial USDC for demo purposes
		// Mint 100,000 USDC to the deployer
		mockUSDC.mint(deployer, 100000 * 10 ** 6); // 100,000 USDC

		vm.stopBroadcast();

		// Log deployment information
		console.log('MockUSDC deployed at:', address(mockUSDC));
		console.log('Owner:', mockUSDC.owner());
		console.log('Deployer balance:', mockUSDC.balanceOf(deployer), 'USDC');
		console.log('Token name:', mockUSDC.name());
		console.log('Token symbol:', mockUSDC.symbol());
		console.log('Decimals:', mockUSDC.decimals());

		// Verify the deployment
		require(mockUSDC.owner() == deployer, 'Owner not set correctly');
		require(mockUSDC.balanceOf(deployer) == 100000 * 10 ** 6, 'Initial mint failed');

		console.log('MockUSDC deployment successful!');
		console.log('');
		console.log('Next steps:');
		console.log('1. Update backend config with USDC address:', address(mockUSDC));
		console.log('2. Use this address as the USDC token in your demo');
		console.log('3. Call mockUSDC.mintDemoAmount() to get 1000 USDC for testing');
		console.log('');
		console.log('=== BACKEND CONFIG UPDATE ===');
		console.log('Update backend/src/config/config.ts with:');
		console.log("export const USDC_ADDRESS: `0x${string}` | '' = '", address(mockUSDC), "';");
		console.log('=== END BACKEND CONFIG UPDATE ===');
	}
}
