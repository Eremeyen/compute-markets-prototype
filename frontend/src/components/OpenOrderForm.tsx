import { useState } from 'react';
import { useOpenOrder, type OpenOrderData } from '../hooks/useOpenOrder';

interface OpenOrderFormProps {
	onSubmit?: (data: OpenOrderData) => void;
}

/**
 * GenAI, clean up this component.
 * @param param0 
 * @returns 
 */
export function OpenOrderForm({ onSubmit }: OpenOrderFormProps) {
	const [selectedSide, setSelectedSide] = useState<'Long' | 'Short'>('Long');

	const { 
		isSubmitting, 
		isConfirming, 
		isSuccess, 
		error, 
		transactionHash, 
		submitOrder, 
		clearError, 
		validateOrder, 
		getValidationRules 
	} = useOpenOrder();

	const validationRules = getValidationRules();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		clearError();

		const formData = new FormData(e.currentTarget);
		const orderData: OpenOrderData = {
			side: formData.get('side') as 'Long' | 'Short',
			size: Number(formData.get('size')),
			expiry: Number(formData.get('expiry')),
		};

		// Validate order
		const validation = validateOrder(orderData);
		if (!validation.isValid) {
			console.error('Validation errors:', validation.errors);
			return;
		}

		// Use custom onSubmit if provided, otherwise use hook's submitOrder
		if (onSubmit) {
			onSubmit(orderData);
		} else {
			const result = await submitOrder(orderData);
			if (result.success) {
				console.log('Order submitted successfully:', result.orderId);
			}
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
							checked={selectedSide === 'Long'}
							onChange={(e) => setSelectedSide(e.target.value as 'Long' | 'Short')}
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
							checked={selectedSide === 'Short'}
							onChange={(e) => setSelectedSide(e.target.value as 'Long' | 'Short')}
							className="sr-only peer"
						/>
						<div className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 peer-checked:bg-cmx-red peer-checked:text-white text-neutral-600 dark:text-neutral-400 peer-checked:shadow-sm">
							Short
						</div>
					</label>
				</div>
			</div>
			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Error message */}
				{error && (
					<div className="p-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800 flex items-center justify-between">
						<span>{error}</span>
						<button onClick={clearError} className="text-red-400 hover:text-red-600 ml-2">
							×
						</button>
					</div>
				)}

				{/* Success message */}
				{isSuccess && transactionHash && (
					<div className="p-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
						<div className="flex items-center gap-2">
							<span>✅ Order submitted successfully!</span>
						</div>
						<div className="text-xs text-green-500 dark:text-green-400 mt-1 font-mono">
							Tx: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
						</div>
					</div>
				)}

				{/* Side-by-side inputs with icons/labels */}
				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1">
						<label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
							Size
						</label>
						<div className="relative">
							<input
								name="size"
								className="w-full px-3 py-2 text-center rounded-md border-2 border-neutral-300 dark:border-neutral-700 bg-transparent font-medium disabled:opacity-50"
								type="number"
								min={validationRules.size.min}
								max={validationRules.size.max}
								step={validationRules.size.step}
								defaultValue={10}
								disabled={isSubmitting}
								required
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
								className="w-full px-3 py-2 text-center rounded-md border-2 border-neutral-300 dark:border-neutral-700 bg-transparent font-medium disabled:opacity-50"
								type="number"
								min={validationRules.expiry.min}
								max={validationRules.expiry.max}
								step={validationRules.expiry.step}
								defaultValue={30}
								disabled={isSubmitting}
								required
							/>
							<div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
								<span className="text-xs text-neutral-400">mins</span>
							</div>
						</div>
					</div>
				</div>
				<button
					type="submit"
					disabled={isSubmitting}
					className={`w-full px-4 py-2 rounded-md border-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 ${
						selectedSide === 'Long'
							? 'border-cmx-green bg-cmx-green text-white hover:bg-cmx-green/90'
							: 'border-cmx-red bg-cmx-red text-white hover:bg-cmx-red/90'
					}`}
				>
					{isSubmitting ? (
						<>
							<div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
							{isConfirming ? 'Confirming...' : 'Submitting...'}
						</>
					) : (
						'Open Order'
					)}
				</button>
			</form>
		</div>
	);
}
