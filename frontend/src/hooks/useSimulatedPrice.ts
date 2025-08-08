import { useEffect, useMemo, useRef, useState } from 'react';

export type SimulatedPriceOptions = {
	start?: number;
	volatility?: number; // +/- percent per tick
	intervalMs?: number;
	historyPoints?: number;
	initialHistory?: number[]; // pre-seeded history
};

export function useSimulatedPrice(options: SimulatedPriceOptions = {}) {
	const {
		start = 1.25,
		volatility = 0.01,
		intervalMs = 3000,
		historyPoints = 60,
		initialHistory,
	} = options;
	// seed only once across remounts (dev / HMR) using module-level cache
	const seededRef = useRef<number[] | null>(null);
	if (!seededRef.current) {
		seededRef.current =
			initialHistory && initialHistory.length > 0
				? initialHistory
				: Array.from({ length: historyPoints }, () => start);
	}
	const seeded = seededRef.current;
	const [price, setPrice] = useState(seeded![seeded!.length - 1] ?? start);
	const [history, setHistory] = useState<number[]>(seeded!);
	const [lastTimestamp, setLastTimestamp] = useState<number>(() => Math.floor(Date.now() / 1000));
	const timerRef = useRef<number | null>(null);
	const tickRef = useRef<number>(seeded!.length - 1);
	const [points, setPoints] = useState<{ t: number; p: number }[]>(() =>
		seeded!.map((p, i) => ({ t: i, p })),
	);

	useEffect(() => {
		timerRef.current = window.setInterval(() => {
			// random walk with mild drift to simulate market
			const delta = (Math.random() * 2 - 1) * volatility;
			setPrice((prev) => {
				const next = Math.max(0.01, +(prev * (1 + delta)).toFixed(4));
				setHistory((h) => [...h.slice(-(historyPoints - 1)), next]);
				// advance tick and push point to series with stable, increasing x-axis
				tickRef.current += 1;
				setPoints((pts) => {
					const updated = [
						...pts.slice(-(historyPoints - 1)),
						{ t: tickRef.current, p: next },
					];
					return updated;
				});
				setLastTimestamp(Math.floor(Date.now() / 1000));
				return next;
			});
		}, intervalMs);
		return () => {
			if (timerRef.current) window.clearInterval(timerRef.current);
		};
	}, [intervalMs, volatility, historyPoints]);

	const trend = useMemo(() => {
		if (history.length < 2) return 0;
		return history[history.length - 1] - history[history.length - 2];
	}, [history]);

	return { price, history, points, lastTimestamp, trend };
}

export function generateSeedHistory(length: number, start: number, volatility = 0.01): number[] {
	const arr: number[] = [start];
	for (let i = 1; i < length; i++) {
		const change = (Math.random() * 2 - 1) * volatility;
		const next = Math.max(0.01, +(arr[i - 1] * (1 + change)).toFixed(4));
		arr.push(next);
	}
	return arr;
}
