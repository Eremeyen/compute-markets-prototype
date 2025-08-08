import { useState, useCallback, useEffect } from 'react';

// not necessarily correct
export interface Order {
	id: number;
	side: 'Long' | 'Short';
	size: number;
	entry: number;
	timestamp?: number;
	userId?: string;
}

export interface OrderBoardState {
	longOrders: Order[];
	shortOrders: Order[];
	isLoading: boolean;
	error: string | null;
	lastTakenOrder: Order | null;
	isTakingOrder: boolean;
}

// not necessarily correct
export interface TakeOrderResult {
	success: boolean;
	orderId?: number;
	error?: string;
}

export function useOrderBoard() {
	const [state, setState] = useState<OrderBoardState>({
		longOrders: [],
		shortOrders: [],
		isLoading: false,
		error: null,
		lastTakenOrder: null,
		isTakingOrder: false,
	});

	// Default dummy data for development
	const getDefaultOrders = useCallback((): Order[] => {
		return [
			{
				id: 1,
				side: 'Long',
				size: 10,
				entry: 1.23,
				timestamp: Date.now() - 300000, // 5 minutes ago
			},
			{
				id: 2,
				side: 'Long',
				size: 15,
				entry: 1.25,
				timestamp: Date.now() - 180000, // 3 minutes ago
			},
			{
				id: 3,
				side: 'Short',
				size: 8,
				entry: 1.28,
				timestamp: Date.now() - 240000, // 4 minutes ago
			},
			{
				id: 4,
				side: 'Short',
				size: 12,
				entry: 1.26,
				timestamp: Date.now() - 120000, // 2 minutes ago
			},
		];
	}, []);

	// Load orders from API
	const loadOrders = useCallback(async () => {
		setState((prev) => ({ ...prev, isLoading: true, error: null }));

		try {
			// TODO: Replace with actual API call
			console.log('Loading orders from API...');

			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 500));

			// TODO: Actual API call here
			// const ordersResponse = await orderApi.getOrders();

			// For now, use default dummy data
			const orders = getDefaultOrders();

			setState((prev) => ({
				...prev,
				longOrders: orders.filter((order) => order.side === 'Long'),
				shortOrders: orders.filter((order) => order.side === 'Short'),
				isLoading: false,
			}));
		} catch (error) {
			setState((prev) => ({
				...prev,
				isLoading: false,
				error: error instanceof Error ? error.message : 'Failed to load orders',
			}));
		}
	}, [getDefaultOrders]);

	// Take an order
	const takeOrder = useCallback(async (order: Order): Promise<TakeOrderResult> => {
		setState((prev) => ({ ...prev, isTakingOrder: true, error: null }));

		try {
			// TODO: Replace with actual API call
			console.log('Taking order:', order);

			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 800));

			// TODO: Actual order taking logic here
			// const result = await orderApi.takeOrder(order.id);

			setState((prev) => ({
				...prev,
				isTakingOrder: false,
				lastTakenOrder: order,
				// Remove the taken order from the lists
				longOrders: prev.longOrders.filter((o) => o.id !== order.id),
				shortOrders: prev.shortOrders.filter((o) => o.id !== order.id),
			}));

			return { success: true, orderId: order.id };
		} catch (error) {
			setState((prev) => ({
				...prev,
				isTakingOrder: false,
				error: error instanceof Error ? error.message : 'Failed to take order',
			}));

			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to take order',
			};
		}
	}, []);

	// Refresh orders
	const refreshOrders = useCallback(() => {
		loadOrders();
	}, [loadOrders]);

	// Clear error state
	const clearError = useCallback(() => {
		setState((prev) => ({ ...prev, error: null }));
	}, []);

	// Filter orders by criteria
	const filterOrders = useCallback(
		(
			orders: Order[],
			criteria: {
				minSize?: number;
				maxSize?: number;
				minPrice?: number;
				maxPrice?: number;
				side?: 'Long' | 'Short';
			},
		) => {
			return orders.filter((order) => {
				if (criteria.minSize && order.size < criteria.minSize) return false;
				if (criteria.maxSize && order.size > criteria.maxSize) return false;
				if (criteria.minPrice && order.entry < criteria.minPrice) return false;
				if (criteria.maxPrice && order.entry > criteria.maxPrice) return false;
				if (criteria.side && order.side !== criteria.side) return false;
				return true;
			});
		},
		[],
	);

	// Sort orders
	const sortOrders = useCallback(
		(
			orders: Order[],
			sortBy: 'price' | 'size' | 'timestamp',
			direction: 'asc' | 'desc' = 'asc',
		) => {
			return [...orders].sort((a, b) => {
				let comparison = 0;

				switch (sortBy) {
					case 'price':
						comparison = a.entry - b.entry;
						break;
					case 'size':
						comparison = a.size - b.size;
						break;
					case 'timestamp':
						comparison = (a.timestamp || 0) - (b.timestamp || 0);
						break;
				}

				return direction === 'asc' ? comparison : -comparison;
			});
		},
		[],
	);

	// Get order statistics
	const getOrderStats = useCallback(() => {
		const allOrders = [...state.longOrders, ...state.shortOrders];

		if (allOrders.length === 0) {
			return {
				totalOrders: 0,
				totalVolume: 0,
				averagePrice: 0,
				priceRange: { min: 0, max: 0 },
			};
		}

		const totalVolume = allOrders.reduce((sum, order) => sum + order.size, 0);
		const averagePrice =
			allOrders.reduce((sum, order) => sum + order.entry, 0) / allOrders.length;
		const prices = allOrders.map((order) => order.entry);

		return {
			totalOrders: allOrders.length,
			totalVolume,
			averagePrice,
			priceRange: {
				min: Math.min(...prices),
				max: Math.max(...prices),
			},
		};
	}, [state.longOrders, state.shortOrders]);

	// Load orders on mount
	useEffect(() => {
		loadOrders();
	}, [loadOrders]);

	return {
		// State
		...state,
		allOrders: [...state.longOrders, ...state.shortOrders],

		// Actions
		takeOrder,
		refreshOrders,
		clearError,

		// Utilities
		filterOrders,
		sortOrders,
		getOrderStats,

		// Data helpers
		getDefaultOrders,
	};
}
