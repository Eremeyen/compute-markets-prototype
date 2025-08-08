import { useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, type BaseError } from 'wagmi';

export interface AuthState {
	address: `0x${string}` | undefined;
	chainId: number | undefined;
	isConnected: boolean;
	isConnecting: boolean;
	isReconnecting: boolean;
	status: 'connecting' | 'reconnecting' | 'connected' | 'disconnected';
	error: string | null;
}

export function useAuth() {
	const account = useAccount();
	const connect = useConnect();
	const disconnect = useDisconnect();

	// Get the first available connector (porto in this case)
	const [connector] = connect.connectors;

	// Connect to wallet
	const authenticate = useCallback(() => {
		if (connector) {
			connect.connect({ connector });
		}
	}, [connect, connector]);

	// Disconnect wallet
	const disconnectWallet = useCallback(() => {
		disconnect.disconnect();
	}, [disconnect]);

	// Get user display name (shortened address)
	const getUserDisplayName = useCallback(() => {
		if (!account.address) return null;

		const address = account.address;
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	}, [account.address]);

	// Clear error state
	const clearError = useCallback(() => {
		// Note: wagmi handles errors internally, this is for consistency with the interface
	}, []);

	// Auth state
	const authState: AuthState = {
		address: account.address,
		chainId: account.chainId,
		isConnected: account.isConnected,
		isConnecting: connect.status === 'pending',
		isReconnecting: account.status === 'reconnecting',
		status: account.status,
		error: connect.error
			? (connect.error as BaseError).shortMessage || connect.error.message
			: null,
	};

	return {
		// State
		...authState,

		// Computed values
		userDisplayName: getUserDisplayName(),

		// Actions
		authenticate,
		disconnect: disconnectWallet,
		clearError,

		// Wagmi specific
		connector,
		connectors: connect.connectors,
	};
}
