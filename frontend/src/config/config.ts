import { porto } from 'porto/wagmi';
import { createConfig, http } from 'wagmi';
import { define } from 'porto/Chains';
import { baseSepolia } from 'wagmi/chains';

const LOCAL_CHAIN = define({
	id: 31337,
	name: 'Local',
	network: 'local',
	nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
	rpcUrls: { default: { http: ['http://localhost:8545'] } },
});

export const config = createConfig({
	chains: [LOCAL_CHAIN, baseSepolia], // Include both local and Base Sepolia
	connectors: [
		porto({
			chains: [LOCAL_CHAIN, baseSepolia], // Porto can use both chains
		}),
	],
	multiInjectedProviderDiscovery: false,
	transports: {
		[LOCAL_CHAIN.id]: http(),
		[baseSepolia.id]: http(), // Add transport for Base Sepolia
	},
});

declare module 'wagmi' {
	interface Register {
		config: typeof config;
	}
}

// Contract addresses (update these with your deployed addresses)
export const CONTRACTS = {
	// From your backend config
	FORWARD_ESCROW: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`, // Update with actual ForwardEscrow address
	H100_ORACLE: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`, // Update with actual Oracle address
	// USDC: '0x...' // Add USDC contract address when needed
} as const;
