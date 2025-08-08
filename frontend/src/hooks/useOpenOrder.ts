import { useState, useCallback, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { ForwardEscrowABI } from '../config/ABIs';
import { CONTRACTS } from '../config/config';

export interface OpenOrderData {
	side: 'Long' | 'Short';
	size: number; // GPU hours
	expiry: number; // expiry in minutes (UI) -> will be converted to seconds
}

export interface OpenOrderResult {
	success: boolean;
	orderId?: bigint;
	transactionHash?: string;
	error?: string;
}

export interface OpenOrderState {
	isSubmitting: boolean;
	lastSubmittedOrder: OpenOrderData | null;
	error: string | null;
	transactionHash: string | null;
	orderId: bigint | null;
}

export function useOpenOrder() {
	const { address, isConnected } = useAccount();
	const { writeContract, data: transactionHash, error: writeError, isPending } = useWriteContract();
	
	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
		hash: transactionHash,
	});

	const [state, setState] = useState<OpenOrderState>({
		isSubmitting: false,
		lastSubmittedOrder: null,
		error: null,
		transactionHash: null,
		orderId: null,
	});

	// Submit order to smart contract
	const submitOrder = useCallback(async (orderData: OpenOrderData): Promise<OpenOrderResult> => {
		if (!isConnected || !address) {
			const error = 'Wallet not connected';
			setState(prev => ({ ...prev, error }));
			return { success: false, error };
		}

		setState(prev => ({ ...prev, isSubmitting: true, error: null, transactionHash: null, orderId: null }));

		try {
			console.log('Submitting order to smart contract:', orderData);

			// Convert side to enum (0 = Long, 1 = Short)
			const side = orderData.side === 'Long' ? 0 : 1;
			
			// Convert expiry from minutes to seconds
			const expirySecs = BigInt(orderData.expiry * 60);
			
			// Convert size to BigInt
			const gpuHours = BigInt(orderData.size);

			// Call the smart contract
			writeContract({
				address: CONTRACTS.FORWARD_ESCROW,
				abi: ForwardEscrowABI,
				functionName: 'open',
				args: [side, gpuHours, expirySecs],
			});

			setState(prev => ({
				...prev,
				lastSubmittedOrder: orderData,
			}));

			// Return immediately - we'll track the transaction status separately
			return { success: true };

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to submit order';
			setState(prev => ({
				...prev,
				isSubmitting: false,
				error: errorMessage,
			}));

			return { success: false, error: errorMessage };
		}
	}, [isConnected, address, writeContract]);

	// Clear error state
	const clearError = useCallback(() => {
		setState((prev) => ({ ...prev, error: null }));
	}, []);

	// Reset form state
	const resetForm = useCallback(() => {
		setState({
			isSubmitting: false,
			lastSubmittedOrder: null,
			error: null,
			transactionHash: null,
			orderId: null,
		});
	}, []);

	// Get form validation rules
	const getValidationRules = useCallback(() => {
		return {
			size: {
				min: 1,
				max: 1000,
				step: 1,
			},
			expiry: {
				min: 5,
				max: 1440, // 24 hours in minutes
				step: 5,
			},
		};
	}, []);

	// Validate order data
	const validateOrder = useCallback(
		(orderData: OpenOrderData) => {
			const rules = getValidationRules();
			const errors: string[] = [];

			if (orderData.size < rules.size.min || orderData.size > rules.size.max) {
				errors.push(`Size must be between ${rules.size.min} and ${rules.size.max} GPU-hrs`);
			}

			if (orderData.expiry < rules.expiry.min || orderData.expiry > rules.expiry.max) {
				errors.push(
					`Expiry must be between ${rules.expiry.min} and ${rules.expiry.max} minutes`,
				);
			}

			return {
				isValid: errors.length === 0,
				errors,
			};
		},
		[getValidationRules],
	);

	// Update state when transaction status changes
	useEffect(() => {
		if (transactionHash) {
			setState(prev => ({ 
				...prev, 
				transactionHash: transactionHash,
				isSubmitting: isPending || isConfirming,
			}));
		}
	}, [transactionHash, isPending, isConfirming]);

	// Handle transaction completion
	useEffect(() => {
		if (isSuccess && transactionHash) {
			setState(prev => ({ 
				...prev, 
				isSubmitting: false,
			}));
		}
	}, [isSuccess, transactionHash]);

	// Handle write errors
	useEffect(() => {
		if (writeError) {
			setState(prev => ({ 
				...prev, 
				isSubmitting: false,
				error: writeError.message || 'Transaction failed',
			}));
		}
	}, [writeError]);

	return {
		// State
		...state,
		isSubmitting: state.isSubmitting || isPending || isConfirming,
		
		// Transaction status
		isConfirming,
		isSuccess,
		
		// Actions
		submitOrder,
		clearError,
		resetForm,

		// Utilities
		validateOrder,
		getValidationRules,
	};
}
