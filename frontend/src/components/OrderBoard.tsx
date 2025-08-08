interface Order {
	id: number;
	side: 'Long' | 'Short';
	size: number;
	entry: number;
}

interface OrderBoardProps {
	orders?: Order[];
}

export function OrderBoard({ orders = [] }: OrderBoardProps) {
	// Default dummy data if no orders provided
	const defaultOrders: Order[] = [
		{
			id: 1,
			side: 'Long',
			size: 10,
			entry: 1.23,
		},
		{
			id: 2,
			side: 'Long',
			size: 15,
			entry: 1.25,
		},
		{
			id: 3,
			side: 'Short',
			size: 8,
			entry: 1.28,
		},
		{
			id: 4,
			side: 'Short',
			size: 12,
			entry: 1.26,
		},
	];

	const ordersToShow = orders.length > 0 ? orders : defaultOrders;
	const longOrders = ordersToShow.filter(order => order.side === 'Long');
	const shortOrders = ordersToShow.filter(order => order.side === 'Short');

	const OrderTable = ({ orders, side }: { orders: Order[], side: 'Long' | 'Short' }) => (
		<div className={`rounded-lg border-2 p-3 ${
			side === 'Long' 
				? 'border-cmx-green/30 bg-cmx-green/5' 
				: 'border-cmx-red/30 bg-cmx-red/5'
		}`}>
			<h3 className={`text-sm font-semibold mb-2 text-center ${
				side === 'Long' ? 'text-cmx-green' : 'text-cmx-red'
			}`}>
				{side} Orders
			</h3>
			<table className="w-full text-xs table-fixed">
				<thead>
					<tr className={`border-b ${
						side === 'Long' 
							? 'border-cmx-green/20' 
							: 'border-cmx-red/20'
					}`}>
						<th className="py-1 text-center w-12">ID</th>
						<th className="text-center w-16">Size</th>
						<th className="text-center w-20">Price</th>
						<th className="text-center w-16">Action</th>
					</tr>
				</thead>
				<tbody>
					{orders.map((order) => (
						<tr key={order.id} className={`border-b ${
							side === 'Long' 
								? 'border-cmx-green/10' 
								: 'border-cmx-red/10'
						}`}>
							<td className="py-1 text-center">{order.id}</td>
							<td className="text-center">{order.size}</td>
							<td className="text-center">${order.entry.toFixed(2)}</td>
							<td className="text-center">
								<button className={`px-2 py-1 text-xs rounded border ${
									side === 'Long' 
										? 'border-cmx-green text-cmx-green hover:bg-cmx-green/10' 
										: 'border-cmx-red text-cmx-red hover:bg-cmx-red/10'
								}`}>
									Take
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);

	return (
		<div className="rounded-xl border-2 border-neutral-300 dark:border-neutral-700 p-4">
			<div className="mb-4 font-semibold text-center">Order Board</div>
			<div className="space-y-3">
				<OrderTable orders={longOrders} side="Long" />
				<OrderTable orders={shortOrders} side="Short" />
			</div>
		</div>
	);
}
