import { useState, useCallback, useEffect, useMemo } from 'react';

export interface Position {
	id: string;
	side: 'Long' | 'Short';
	size: number;
	entryPrice: number;
	currentPnL: number;
	openTimestamp?: number;
	lastUpdateTimestamp?: number;
	unrealizedPnL?: number;
	realizedPnL?: number;
	expiryTimestamp: number; // When the position expires
	canSettle: boolean; // Whether the position can be settled now
	isExpired: boolean; // Whether the position has expired
}

export interface PositionsState {
	positions: Position[];
	isLoading: boolean;
	isRefreshing: boolean; // Background refresh without hiding content
	error: string | null;
	isSettlingPosition: boolean;
	lastSettledPosition: Position | null;
}

export interface SettlePositionResult {
	success: boolean;
	positionId?: string;
	realizedPnL?: number;
	settlementPrice?: number;
	error?: string;
}

export interface PositionStats {
	totalPositions: number;
	totalUnrealizedPnL: number;
	totalSize: number;
	longPositions: number;
	shortPositions: number;
	averageEntryPrice: number;
	largestPosition: Position | null;
	expiredPositions: number;
	settlablePositions: number;
}

export function usePositions(currentPrice: number = 0) {
	const [state, setState] = useState<PositionsState>({
		positions: [],
		isLoading: false,
		isRefreshing: false,
		error: null,
		isSettlingPosition: false,
		lastSettledPosition: null,
	});

	// Check if a position is expired
	const isPositionExpired = useCallback((position: Position) => {
		return Date.now() >= position.expiryTimestamp;
	}, []);

	// Check if a position can be settled
	const canSettlePosition = useCallback((position: Position) => {
		// Simple rule: can settle if expired
		return position.isExpired;
	}, []);

	// Default dummy data for development - using static timestamps to avoid data regeneration
	const getDefaultPositions = useCallback((): Position[] => {
		// Use a fixed base time to ensure consistent data across refreshes
		const baseTime = 1700000000000; // Fixed timestamp
		const now = Date.now();

		return [
			{
				id: 'P1',
				side: 'Long',
				size: 15,
				entryPrice: 1.22,
				currentPnL: 0.45,
				openTimestamp: baseTime,
				lastUpdateTimestamp: now,
				unrealizedPnL: 0.45,
				realizedPnL: 0,
				expiryTimestamp: now + 1800000, // Expires in 30 minutes from now
				canSettle: false, // Not expired yet
				isExpired: false,
			},
			{
				id: 'P2',
				side: 'Short',
				size: 5,
				entryPrice: 1.26,
				currentPnL: -0.05,
				openTimestamp: baseTime + 300000,
				lastUpdateTimestamp: now,
				unrealizedPnL: -0.05,
				realizedPnL: 0,
				expiryTimestamp: now - 300000, // Expired 5 minutes ago
				canSettle: true, // Expired and can be settled
				isExpired: true,
			},
		];
	}, []);

	// Calculate real-time P&L based on current price
	const calculatePnL = useCallback((position: Position, marketPrice: number) => {
		if (marketPrice === 0) return position.currentPnL;

		const priceDiff = marketPrice - position.entryPrice;
		const multiplier = position.side === 'Long' ? 1 : -1;
		const unrealizedPnL = priceDiff * multiplier * position.size;

		return unrealizedPnL;
	}, []);

	// Update positions with current market price
	const updatePositionsWithPrice = useCallback(
		(positions: Position[], marketPrice: number) => {
			return positions.map((position) => {
				const isExpired = isPositionExpired(position);
				return {
					...position,
					currentPnL: calculatePnL(position, marketPrice),
					unrealizedPnL: calculatePnL(position, marketPrice),
					lastUpdateTimestamp: Date.now(),
					isExpired,
					canSettle: isExpired,
				};
			});
		},
		[calculatePnL, isPositionExpired],
	);

	// Load positions from API
	const loadPositions = useCallback(
		async (isInitialLoad = false) => {
			// For initial load, show full loading state
			// For subsequent refreshes, just show refreshing indicator
			if (isInitialLoad) {
				setState((prev) => ({ ...prev, isLoading: true, error: null }));
			} else {
				setState((prev) => ({ ...prev, isRefreshing: true, error: null }));
			}

			try {
				// TODO: Replace with actual API call
				console.log('Loading positions from API...');

				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 600));

				// TODO: Actual API call here
				// const positionsResponse = await positionsApi.getPositions();

				// For now, use default dummy data
				const positions = getDefaultPositions();
				const updatedPositions = updatePositionsWithPrice(positions, currentPrice);

				setState((prev) => ({
					...prev,
					positions: updatedPositions,
					isLoading: false,
					isRefreshing: false,
				}));
			} catch (error) {
				setState((prev) => ({
					...prev,
					isLoading: false,
					isRefreshing: false,
					error: error instanceof Error ? error.message : 'Failed to load positions',
				}));
			}
		},
		[getDefaultPositions, updatePositionsWithPrice],
	); // Remove currentPrice dependency

	// Settle an expired position
	const settlePosition = useCallback(
		async (positionId: string): Promise<SettlePositionResult> => {
			setState((prev) => ({ ...prev, isSettlingPosition: true, error: null }));

			try {
				const position = state.positions.find((p) => p.id === positionId);
				if (!position) {
					throw new Error('Position not found');
				}

				if (!position.isExpired) {
					throw new Error('Position has not expired yet');
				}

				// Position is expired, can be settled

				// TODO: Replace with actual API call
				console.log('Settling expired position:', position);

				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 1200));

				// TODO: Actual position settlement logic here
				// const result = await positionsApi.settlePosition(positionId);

				const settlementPrice = currentPrice; // In reality, this would be from oracle
				const realizedPnL = position.currentPnL;

				setState((prev) => ({
					...prev,
					isSettlingPosition: false,
					lastSettledPosition: position,
					// Remove the settled position
					positions: prev.positions.filter((p) => p.id !== positionId),
				}));

				return { success: true, positionId, realizedPnL, settlementPrice };
			} catch (error) {
				setState((prev) => ({
					...prev,
					isSettlingPosition: false,
					error: error instanceof Error ? error.message : 'Failed to settle position',
				}));

				return {
					success: false,
					error: error instanceof Error ? error.message : 'Failed to settle position',
				};
			}
		},
		[state.positions, currentPrice],
	);

	// Refresh positions (manual refresh)
	const refreshPositions = useCallback(() => {
		loadPositions(false); // Not initial load
	}, [loadPositions]);

	// Clear error state
	const clearError = useCallback(() => {
		setState((prev) => ({ ...prev, error: null }));
	}, []);

	// Filter positions by criteria
	const filterPositions = useCallback(
		(criteria: {
			side?: 'Long' | 'Short';
			minSize?: number;
			maxSize?: number;
			profitOnly?: boolean;
			lossOnly?: boolean;
		}) => {
			return state.positions.filter((position) => {
				if (criteria.side && position.side !== criteria.side) return false;
				if (criteria.minSize && position.size < criteria.minSize) return false;
				if (criteria.maxSize && position.size > criteria.maxSize) return false;
				if (criteria.profitOnly && position.currentPnL <= 0) return false;
				if (criteria.lossOnly && position.currentPnL >= 0) return false;
				return true;
			});
		},
		[state.positions],
	);

	// Sort positions
	const sortPositions = useCallback(
		(sortBy: 'pnl' | 'size' | 'entry' | 'time', direction: 'asc' | 'desc' = 'desc') => {
			return [...state.positions].sort((a, b) => {
				let comparison = 0;

				switch (sortBy) {
					case 'pnl':
						comparison = a.currentPnL - b.currentPnL;
						break;
					case 'size':
						comparison = a.size - b.size;
						break;
					case 'entry':
						comparison = a.entryPrice - b.entryPrice;
						break;
					case 'time':
						comparison = (a.openTimestamp || 0) - (b.openTimestamp || 0);
						break;
				}

				return direction === 'asc' ? comparison : -comparison;
			});
		},
		[state.positions],
	);

	// Calculate position statistics
	const positionStats = useMemo((): PositionStats => {
		const positions = state.positions;

		if (positions.length === 0) {
			return {
				totalPositions: 0,
				totalUnrealizedPnL: 0,
				totalSize: 0,
				longPositions: 0,
				shortPositions: 0,
				averageEntryPrice: 0,
				largestPosition: null,
				expiredPositions: 0,
				settlablePositions: 0,
			};
		}

		const longCount = positions.filter((p) => p.side === 'Long').length;
		const shortCount = positions.length - longCount;
		const expiredCount = positions.filter((p) => p.isExpired).length;
		const settlableCount = positions.filter((p) => p.canSettle).length;
		const totalPnL = positions.reduce((sum, p) => sum + p.currentPnL, 0);
		const totalSize = positions.reduce((sum, p) => sum + p.size, 0);
		const averageEntry = positions.reduce((sum, p) => sum + p.entryPrice, 0) / positions.length;
		const largestBySize = positions.reduce(
			(largest, current) => (current.size > (largest?.size || 0) ? current : largest),
			positions[0],
		);

		return {
			totalPositions: positions.length,
			totalUnrealizedPnL: totalPnL,
			totalSize,
			longPositions: longCount,
			shortPositions: shortCount,
			averageEntryPrice: averageEntry,
			largestPosition: largestBySize,
			expiredPositions: expiredCount,
			settlablePositions: settlableCount,
		};
	}, [state.positions]);

	// Update positions when current price changes - separate from data loading
	useEffect(() => {
		if (state.positions.length > 0 && currentPrice > 0) {
			// Use a timeout to debounce rapid price changes
			const timeoutId = setTimeout(() => {
				setState((prev) => ({
					...prev,
					positions: updatePositionsWithPrice(prev.positions, currentPrice),
				}));
			}, 100); // 100ms debounce

			return () => clearTimeout(timeoutId);
		}
	}, [currentPrice, updatePositionsWithPrice]);

	// Load positions on mount and set up auto-refresh
	useEffect(() => {
		// Initial load
		loadPositions(true);

		// Set up auto-refresh every 2 minutes to reduce interference
		const refreshInterval = setInterval(() => {
			loadPositions(false); // Background refresh
		}, 120000); // 2 minutes

		return () => clearInterval(refreshInterval);
	}, [loadPositions]);

	return {
		// State
		...state,

		// Computed values
		positionStats,
		longPositions: state.positions.filter((p) => p.side === 'Long'),
		shortPositions: state.positions.filter((p) => p.side === 'Short'),
		expiredPositions: state.positions.filter((p) => p.isExpired),
		settlablePositions: state.positions.filter((p) => p.canSettle),

		// Actions
		settlePosition,
		refreshPositions,
		clearError,

		// Utilities
		filterPositions,
		sortPositions,
		calculatePnL,
		isPositionExpired,
		canSettlePosition,

		// Data helpers
		getDefaultPositions,
	};
}
