import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSimulatedPrice, generateSeedHistory } from './useSimulatedPrice';

export interface PricePoint {
	t: number; // timestamp
	p: number; // price
}

export interface PriceChartData {
	currentPrice: number;
	priceHistory: PricePoint[];
	chartPoints: PricePoint[];
	trend: number;
	lastTimestamp: number;
	isLoading: boolean;
	error: string | null;
}

export interface PriceChartOptions {
	windowSize?: number; // Number of points to display in chart
	refreshInterval?: number; // Refresh interval in ms
	useSimulatedData?: boolean; // Whether to use simulated data (for development)
}

export function usePriceChart(options: PriceChartOptions = {}) {
	const {
		windowSize = 60,
		refreshInterval = 5000,
		useSimulatedData = true, // Default to simulated data for now
	} = options;

	const [state, setState] = useState<
		Omit<
			PriceChartData,
			'currentPrice' | 'priceHistory' | 'chartPoints' | 'trend' | 'lastTimestamp'
		>
	>({
		isLoading: false,
		error: null,
	});

	// Generate seed data for simulated price (only when using simulated data)
	const seedHistory = useMemo(() => {
		return useSimulatedData ? generateSeedHistory(60, 1.25, 0.006) : [];
	}, [useSimulatedData]);

	// Always call useSimulatedPrice hook (required by React hook rules)
	// but only use the data when useSimulatedData is true
	const simulatedPriceData = useSimulatedPrice({
		start: 1.25,
		intervalMs: refreshInterval,
		initialHistory: seedHistory,
	});

	// Load real price data from API/smart contracts
	const loadRealPriceData = useCallback(async (): Promise<{
		currentPrice: number;
		history: PricePoint[];
		trend: number;
		lastTimestamp: number;
	}> => {
		// TODO: Replace with actual API/smart contract calls
		console.log('Loading real price data from smart contracts...');

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		// TODO: Implement actual data fetching
		// Example structure for future implementation:
		// const priceData = await oracleContract.getCurrentPrice();
		// const historyData = await oracleContract.getPriceHistory(windowSize);

		// For now, return dummy data structure
		const now = Math.floor(Date.now() / 1000);
		return {
			currentPrice: 1.25,
			history: [
				{ t: now - 3600, p: 1.24 },
				{ t: now - 1800, p: 1.26 },
				{ t: now, p: 1.25 },
			],
			trend: 0.01,
			lastTimestamp: now,
		};
	}, [windowSize]);

	// Real data state for when not using simulated data
	const [realData, setRealData] = useState<{
		currentPrice: number;
		history: PricePoint[];
		trend: number;
		lastTimestamp: number;
	} | null>(null);

	// Load real data when not using simulated data
	useEffect(() => {
		if (!useSimulatedData) {
			setState((prev) => ({ ...prev, isLoading: true, error: null }));

			loadRealPriceData()
				.then((data) => {
					setRealData(data);
					setState((prev) => ({ ...prev, isLoading: false }));
				})
				.catch((error) => {
					setState((prev) => ({
						...prev,
						isLoading: false,
						error: error instanceof Error ? error.message : 'Failed to load price data',
					}));
				});

			// Set up refresh interval for real data
			const intervalId = setInterval(() => {
				loadRealPriceData()
					.then((data) => setRealData(data))
					.catch((error) => {
						setState((prev) => ({
							...prev,
							error:
								error instanceof Error
									? error.message
									: 'Failed to refresh price data',
						}));
					});
			}, refreshInterval);

			return () => clearInterval(intervalId);
		}
	}, [useSimulatedData, loadRealPriceData, refreshInterval]);

	// Prepare chart data with window size filtering
	const chartData = useMemo(() => {
		const sourceData = useSimulatedData ? simulatedPriceData.points : realData?.history || [];
		return windowSize > 0 ? sourceData.slice(-windowSize) : sourceData;
	}, [useSimulatedData, simulatedPriceData.points, realData?.history, windowSize]);

	// Refresh data manually
	const refreshData = useCallback(async () => {
		if (useSimulatedData) {
			// For simulated data, no manual refresh needed as it auto-updates
			return;
		}

		setState((prev) => ({ ...prev, isLoading: true, error: null }));
		try {
			const data = await loadRealPriceData();
			setRealData(data);
		} catch (error) {
			setState((prev) => ({
				...prev,
				error: error instanceof Error ? error.message : 'Failed to refresh price data',
			}));
		} finally {
			setState((prev) => ({ ...prev, isLoading: false }));
		}
	}, [useSimulatedData, loadRealPriceData]);

	// Clear error state
	const clearError = useCallback(() => {
		setState((prev) => ({ ...prev, error: null }));
	}, []);

	// Return the appropriate data based on mode
	const currentPrice = useSimulatedData ? simulatedPriceData.price : realData?.currentPrice || 0;
	const priceHistory = useSimulatedData ? simulatedPriceData.history : realData?.history || [];
	const trend = useSimulatedData ? simulatedPriceData.trend : realData?.trend || 0;
	const lastTimestamp = useSimulatedData
		? simulatedPriceData.lastTimestamp
		: realData?.lastTimestamp || 0;

	return {
		// Current state
		currentPrice,
		priceHistory,
		chartPoints: chartData,
		trend,
		lastTimestamp,
		isLoading: state.isLoading,
		error: state.error,

		// Actions
		refreshData,
		clearError,

		// Configuration
		isUsingSimulatedData: useSimulatedData,
		windowSize,
	};
}
