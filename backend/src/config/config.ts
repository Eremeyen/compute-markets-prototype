import { type Chain } from 'viem/chains';
import { defineChain } from 'viem';
// RPC endpoint for viem wallet client
export const RPC_URL = 'http://localhost:8545';

// Deployed oracle contract address (set this to your deployed H100Oracle address)
export const ORACLE_ADDRESS: `0x${string}` | '' = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Private key for an account that is owner or trusted updater of the oracle
// Public key: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
export const ORACLE_UPDATER_PRIVATE_KEY: string | '' =
	'0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

// Cron expression (with seconds field) — every 30 seconds
export const CRON_EXPR = '*/30 * * * * *';

export const chain: Chain = defineChain({
	id: 31337,
	name: 'Foundry',
	nativeCurrency: {
		name: 'Ether',
		symbol: 'ETH',
		decimals: 18,
	},
	rpcUrls: {
		default: {
			http: [RPC_URL],
		},
	},
});
