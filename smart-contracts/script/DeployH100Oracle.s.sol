// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console } from 'forge-std/Script.sol';
import { H100Oracle } from '../src/H100Oracle.sol';

contract DeployH100OracleScript is Script {
	H100Oracle public oracle;

	function setUp() public {}

	function run() public {
		// Get the deployer address
		address deployer = vm.addr(vm.envUint('PRIVATE_KEY'));
		console.log('Deploying H100Oracle with deployer:', deployer);

		// Start broadcasting transactions
		vm.startBroadcast();

		// Deploy the H100Oracle contract
		// The constructor takes an initial trusted updater address
		// For demo purposes, we'll set the deployer as the initial trusted updater
		oracle = new H100Oracle(deployer);

		vm.stopBroadcast();

		// Log deployment information
		console.log('H100Oracle deployed at:', address(oracle));
		console.log('Owner:', oracle.owner());
		console.log('Initial trusted updater:', deployer);
		console.log('Stale tolerance:', oracle.STALE_TOLERANCE(), 'seconds');

		// Verify the deployment
		require(oracle.owner() == deployer, 'Owner not set correctly');
		require(oracle.isTrustedUpdater(deployer), 'Deployer not set as trusted updater');

		console.log('H100Oracle deployment successful!');
		console.log('');
		console.log('Next steps:');
		console.log('1. Update backend config with oracle address:', address(oracle));
		console.log('2. Ensure backend private key matches deployer:', deployer);
		console.log('3. Start the backend scheduler to begin price updates');
		console.log('');
		console.log('=== BACKEND CONFIG UPDATE ===');
		console.log('Update backend/src/config/config.ts with:');
		console.log("export const ORACLE_ADDRESS: `0x${string}` | '' = '", address(oracle), "';");
		console.log('=== END BACKEND CONFIG UPDATE ===');
	}
}
