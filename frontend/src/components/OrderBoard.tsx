import { useOrderBoard, type Order } from '../hooks/useOrderBoard';

interface OrderBoardProps {
	orders?: Order[];
	onTakeOrder?: (order: Order) => void;
}

export function OrderBoard({ orders: externalOrders, onTakeOrder }: OrderBoardProps) {
	const {
		longOrders: hookLongOrders,
		shortOrders: hookShortOrders,
		isLoading,
		error,
		isTakingOrder,
		takeOrder,
		refreshOrders,
		clearError,
	} = useOrderBoard();

	// Use external orders if provided, otherwise use hook's orders
	const longOrders = externalOrders
		? externalOrders.filter((order) => order.side === 'Long')
		: hookLongOrders;
	const shortOrders = externalOrders
		? externalOrders.filter((order) => order.side === 'Short')
		: hookShortOrders;

	// Handle taking an order
	const handleTakeOrder = async (order: Order) => {
		if (onTakeOrder) {
			onTakeOrder(order);
		} else {
			const result = await takeOrder(order);
			if (result.success) {
				console.log('Order taken successfully:', result.orderId);
			}
		}
	};

	const OrderTable = ({ orders, side }: { orders: Order[]; side: 'Long' | 'Short' }) => (
		<div
			className={`rounded-lg border-2 p-3 ${
				side === 'Long'
					? 'border-cmx-green/30 bg-cmx-green/5'
					: 'border-cmx-red/30 bg-cmx-red/5'
			}`}
		>
			<h3
				className={`text-sm font-semibold mb-2 text-center ${
					side === 'Long' ? 'text-cmx-green' : 'text-cmx-red'
				}`}
			>
				{side} Orders
			</h3>
			{orders.length === 0 ? (
				<div className="text-center py-4 text-neutral-500 dark:text-neutral-400 text-xs">
					No {side.toLowerCase()} orders available
				</div>
			) : (
				<table className="w-full text-xs table-fixed">
					<thead>
						<tr
							className={`border-b ${
								side === 'Long' ? 'border-cmx-green/20' : 'border-cmx-red/20'
							}`}
						>
							<th className="py-1 text-center w-12">ID</th>
							<th className="text-center w-16">Size</th>
							<th className="text-center w-20">Price</th>
							<th className="text-center w-16">Action</th>
						</tr>
					</thead>
					<tbody>
						{orders.map((order) => (
							<tr
								key={order.id}
								className={`border-b ${
									side === 'Long' ? 'border-cmx-green/10' : 'border-cmx-red/10'
								}`}
							>
								<td className="py-1 text-center">{order.id}</td>
								<td className="text-center">{order.size}</td>
								<td className="text-center">${order.entry.toFixed(2)}</td>
								<td className="text-center">
									<button
										onClick={() => handleTakeOrder(order)}
										disabled={isTakingOrder}
										className={`px-2 py-1 text-xs rounded border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
											side === 'Long'
												? 'border-cmx-green text-cmx-green hover:bg-cmx-green/10'
												: 'border-cmx-red text-cmx-red hover:bg-cmx-red/10'
										}`}
									>
										{isTakingOrder ? (
											<div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
										) : (
											'Take'
										)}
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);

	return (
		<div className="rounded-xl border-2 border-neutral-300 dark:border-neutral-700 p-4">
			<div className="flex items-center justify-between mb-4">
				<div className="font-semibold text-center flex-1">Order Board</div>
				{!externalOrders && (
					<button
						onClick={refreshOrders}
						disabled={isLoading}
						className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50"
					>
						{isLoading ? (
							<div className="w-3 h-3 border border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
						) : (
							'Refresh'
						)}
					</button>
				)}
			</div>

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
			{isLoading && !externalOrders ? (
				<div className="flex items-center justify-center py-8">
					<div className="flex items-center gap-2 text-neutral-500">
						<div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
						Loading orders...
					</div>
				</div>
			) : (
				<div className="space-y-3">
					<OrderTable orders={longOrders} side="Long" />
					<OrderTable orders={shortOrders} side="Short" />
				</div>
			)}
		</div>
	);
}
