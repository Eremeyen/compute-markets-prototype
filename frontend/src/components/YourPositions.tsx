interface Position {
	id: string;
	side: 'Long' | 'Short';
	size: number;
	entryPrice: number;
	currentPnL: number;
}

interface YourPositionsProps {
	positions?: Position[];
	currentPrice: number;
}

export function YourPositions({ positions = [], currentPrice }: YourPositionsProps) {
	// Default dummy data if no positions provided
	const defaultPositions: Position[] = [
		{
			id: 'P1',
			side: 'Long',
			size: 15,
			entryPrice: 1.22,
			currentPnL: 0.45,
		},
		{
			id: 'P2',
			side: 'Short',
			size: 5,
			entryPrice: 1.26,
			currentPnL: -0.05,
		},
	];

	const positionsToShow = positions.length > 0 ? positions : defaultPositions;

	return (
		<div className="rounded-xl border-2 border-neutral-300 dark:border-neutral-700 p-4">
			<div className="mb-2 font-semibold text-center">Your Positions</div>
			<div className="space-y-2">
				{positionsToShow.map((position) => (
					<div
						key={position.id}
						className="p-3 rounded-md border-2 border-neutral-200 dark:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-800/50"
					>
						<div className="flex justify-between items-start mb-1">
							<span className={`text-sm font-medium ${position.side === 'Long' ? 'text-cmx-green' : 'text-cmx-red'}`}>
								{position.side.toUpperCase()} {position.size} GPU-hrs
							</span>
							<span className={`text-sm font-medium ${position.currentPnL >= 0 ? 'text-cmx-green' : 'text-cmx-red'}`}>
								${position.currentPnL >= 0 ? '+' : ''}{position.currentPnL.toFixed(2)}
							</span>
						</div>
						<div className="text-xs text-neutral-500 dark:text-neutral-400">
							Entry: ${position.entryPrice.toFixed(2)} • Current: ${currentPrice.toFixed(2)}
						</div>
					</div>
				))}
				{/* Empty state when no positions */}
				{positionsToShow.length === 0 && (
					<div className="text-center py-4 text-neutral-500 dark:text-neutral-400 text-sm">
						No open positions
					</div>
				)}
			</div>
		</div>
	);
}
