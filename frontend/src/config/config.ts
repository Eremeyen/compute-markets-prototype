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
