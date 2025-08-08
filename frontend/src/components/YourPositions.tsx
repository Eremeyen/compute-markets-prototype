import { usePositions, type Position } from '../hooks/usePositions';

interface YourPositionsProps {
	positions?: Position[];
	currentPrice: number;
	onSettlePosition?: (position: Position) => void;
}

export function YourPositions({
	positions: externalPositions,
	currentPrice,
	onSettlePosition,
}: YourPositionsProps) {
	const {
		positions: hookPositions,
		isLoading,
		isRefreshing,
		error,
		isSettlingPosition,
		positionStats,
		settlePosition,
		refreshPositions,
		clearError,
		canSettlePosition,
	} = usePositions(currentPrice);

	// Use external positions if provided, otherwise use hook's positions
	const positionsToShow = externalPositions || hookPositions;

	// Handle settling an expired position
	const handleSettlePosition = async (position: Position) => {
		if (onSettlePosition) {
			onSettlePosition(position);
		} else {
			const result = await settlePosition(position.id);
			if (result.success) {
				console.log(
					'Position settled successfully:',
					result.positionId,
					'Realized P&L:',
					result.realizedPnL,
					'Settlement Price:',
					result.settlementPrice,
				);
			}
		}
	};

	// Get expiry status text
	const getExpiryStatus = (position: Position) => {
		if (!position.isExpired) {
			const timeToExpiry = position.expiryTimestamp - Date.now();
			const hoursToExpiry = Math.max(0, Math.floor(timeToExpiry / (1000 * 60 * 60)));
			const minutesToExpiry = Math.max(
				0,
				Math.floor((timeToExpiry % (1000 * 60 * 60)) / (1000 * 60)),
			);

			if (hoursToExpiry > 0) {
				return `Expires in ${hoursToExpiry}h ${minutesToExpiry}m`;
			} else if (minutesToExpiry > 0) {
				return `Expires in ${minutesToExpiry}m`;
			} else {
				return 'Expiring soon';
			}
		} else {
			return 'Ready to settle';
		}
	};

	return (
		<div className="rounded-xl border-2 border-neutral-300 dark:border-neutral-700 p-4">
			<div className="flex items-center justify-between mb-4">
				<div className="font-semibold text-center flex-1">Your Positions</div>
				{!externalPositions && (
					<button
						onClick={refreshPositions}
						disabled={isLoading || isRefreshing}
						className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50"
					>
						{isRefreshing ? (
							<div className="w-3 h-3 border border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
						) : (
							'Refresh'
						)}
					</button>
				)}
			</div>

			{/* Position Stats Summary */}
			{positionsToShow.length > 0 && (
				<div className="mb-3 p-2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs">
					<div className="flex justify-between items-center">
						<span className="text-neutral-600 dark:text-neutral-400">Total P&L:</span>
						<span
							className={`font-medium ${positionStats.totalUnrealizedPnL >= 0 ? 'text-cmx-green' : 'text-cmx-red'}`}
						>
							${positionStats.totalUnrealizedPnL >= 0 ? '+' : ''}
							{positionStats.totalUnrealizedPnL.toFixed(2)}
						</span>
					</div>
				</div>
			)}

			{/* Error message */}
			{error && (
				<div className="mb-3 p-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800 flex items-center justify-between">
					<span>{error}</span>
					<button onClick={clearError} className="text-red-400 hover:text-red-600 ml-2">
						×
					</button>
				</div>
			)}

			{/* Loading overlay */}
			{isLoading && !externalPositions ? (
				<div className="flex items-center justify-center py-8">
					<div className="flex items-center gap-2 text-neutral-500">
						<div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
						Loading positions...
					</div>
				</div>
			) : (
				<div className="space-y-2">
					{positionsToShow.map((position) => (
						<div
							key={position.id}
							className={`p-3 rounded-md border-2 bg-neutral-50/50 dark:bg-neutral-800/50 ${
								position.isExpired
									? 'border-yellow-300 dark:border-yellow-600 bg-yellow-50/50 dark:bg-yellow-900/20'
									: 'border-neutral-200 dark:border-neutral-600'
							}`}
						>
							<div className="flex justify-between items-start mb-1">
								<span
									className={`text-sm font-medium ${position.side === 'Long' ? 'text-cmx-green' : 'text-cmx-red'}`}
								>
									{position.side.toUpperCase()} {position.size} GPU-hrs
								</span>
								<span
									className={`text-sm font-medium ${position.currentPnL >= 0 ? 'text-cmx-green' : 'text-cmx-red'}`}
								>
									${position.currentPnL >= 0 ? '+' : ''}
									{position.currentPnL.toFixed(2)}
								</span>
							</div>
							<div className="flex justify-between items-center mb-1">
								<div className="text-xs text-neutral-500 dark:text-neutral-400">
									Entry: ${position.entryPrice.toFixed(2)} • Current: $
									{currentPrice.toFixed(2)}
								</div>
							</div>
							<div className="flex justify-between items-center">
								<div
									className={`text-xs ${
										position.isExpired
											? 'text-green-600 dark:text-green-400 font-medium'
											: 'text-neutral-500 dark:text-neutral-400'
									}`}
								>
									{getExpiryStatus(position)}
								</div>
								{position.isExpired ? (
									<button
										onClick={() => handleSettlePosition(position)}
										disabled={isSettlingPosition}
										className="text-xs px-2 py-1 rounded border border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
									>
										{isSettlingPosition ? (
											<div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
										) : (
											'Settle'
										)}
									</button>
								) : (
									<div className="text-xs px-2 py-1 text-neutral-400 dark:text-neutral-500">
										Active
									</div>
								)}
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
			)}
		</div>
	);
}
