import { useState, useCallback } from 'react';

export interface OpenOrderData {
	side: 'Long' | 'Short';
	size: number;
	expiry: number;
}

export interface OpenOrderState {
	isSubmitting: boolean;
	lastSubmittedOrder: OpenOrderData | null;
	error: string | null;
}

export function useOpenOrder() {
	const [state, setState] = useState<OpenOrderState>({
		isSubmitting: false,
		lastSubmittedOrder: null,
		error: null,
	});

	// Submit order handler
	const submitOrder = useCallback(async (orderData: OpenOrderData) => {
		setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

		try {
			// TODO: Replace with actual API call
			console.log('Submitting order:', orderData);

			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// TODO: Actual order submission logic here
			// const result = await orderApi.submitOrder(orderData);

			setState((prev) => ({
				...prev,
				isSubmitting: false,
				lastSubmittedOrder: orderData,
			}));

			return { success: true, orderId: `order_${Date.now()}` };
		} catch (error) {
			setState((prev) => ({
				...prev,
				isSubmitting: false,
				error: error instanceof Error ? error.message : 'Failed to submit order',
			}));

			return { success: false, error: 'Failed to submit order' };
		}
	}, []);

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

	return {
		// State
		...state,

		// Actions
		submitOrder,
		clearError,
		resetForm,

		// Utilities
		validateOrder,
		getValidationRules,
	};
}
