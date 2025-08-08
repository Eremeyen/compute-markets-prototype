interface OpenOrderFormProps {
	onSubmit?: (data: {
		side: 'Long' | 'Short';
		size: number;
		expiry: number;
	}) => void;
}

export function OpenOrderForm({ onSubmit }: OpenOrderFormProps) {
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const side = formData.get('side') as 'Long' | 'Short';
		const size = Number(formData.get('size'));
		const expiry = Number(formData.get('expiry'));

		if (onSubmit) {
			onSubmit({ side, size, expiry });
		} else {
			alert('Submit dummy');
		}
	};

	return (
		<div className="rounded-xl border-2 border-neutral-300 dark:border-neutral-700 p-4">
			{/* Header with title on left and pill toggle on right */}
			<div className="flex items-center justify-between mb-4">
				<div className="font-bold text-lg">Open Order</div>
				{/* Modern pill toggle for Long/Short */}
				<div className="relative flex bg-neutral-100 dark:bg-neutral-800 rounded-full p-1">
					<label className="relative cursor-pointer">
						<input
							type="radio"
							name="side"
							value="Long"
							defaultChecked
							className="sr-only peer"
						/>
						<div className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 peer-checked:bg-cmx-green peer-checked:text-white text-neutral-600 dark:text-neutral-400 peer-checked:shadow-sm">
							Long
						</div>
					</label>
					<label className="relative cursor-pointer">
						<input
							type="radio"
							name="side"
							value="Short"
							className="sr-only peer"
						/>
						<div className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 peer-checked:bg-cmx-red peer-checked:text-white text-neutral-600 dark:text-neutral-400 peer-checked:shadow-sm">
							Short
						</div>
					</label>
				</div>
			</div>
			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Side-by-side inputs with icons/labels */}
				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1">
						<label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
							Size
						</label>
						<div className="relative">
							<input
								name="size"
								className="w-full px-3 py-2 text-center rounded-md border-2 border-neutral-300 dark:border-neutral-700 bg-transparent font-medium"
								type="number"
								min={1}
								step={1}
								defaultValue={10}
							/>
							<div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
								<span className="text-xs text-neutral-400">GPU-hrs</span>
							</div>
						</div>
					</div>
					<div className="space-y-1">
						<label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
							Expiry
						</label>
						<div className="relative">
							<input
								name="expiry"
								className="w-full px-3 py-2 text-center rounded-md border-2 border-neutral-300 dark:border-neutral-700 bg-transparent font-medium"
								type="number"
								min={5}
								step={5}
								defaultValue={30}
							/>
							<div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
								<span className="text-xs text-neutral-400">mins</span>
							</div>
						</div>
					</div>
				</div>
				<button 
					type="submit"
					className="w-full px-4 py-2 rounded-md border-2 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
				>
					Open Order
				</button>
			</form>
		</div>
	);
}
