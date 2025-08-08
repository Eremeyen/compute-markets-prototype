import { useEffect, useState } from 'react';
import { Sun, Moon, User, LogOut } from 'lucide-react';
import { usePriceChart } from './hooks/usePriceChart';
import { useAuth } from './hooks/useAuth';
import { PriceChart } from './components/PriceChart';
import { StatusBar } from './components/StatusBar';
import { OrderBoard } from './components/OrderBoard';
import { OpenOrderForm } from './components/OpenOrderForm';
import { YourPositions } from './components/YourPositions';

function App() {
	const {
		currentPrice: price,
		chartPoints: chartData,
		trend,
		lastTimestamp,
		isLoading: isPriceLoading,
		error: priceError,
	} = usePriceChart({
		windowSize: 60,
		refreshInterval: 5000,
		useSimulatedData: true, // Set to false when ready to use real data
	});

	const {
		isConnected,
		isConnecting,
		userDisplayName,
		error: authError,
		authenticate,
		disconnect,
		clearError: clearAuthError,
	} = useAuth();
	const [nowMs, setNowMs] = useState<number>(() => Date.now());
	useEffect(() => {
		const id = window.setInterval(() => setNowMs(Date.now()), 1000);
		return () => window.clearInterval(id);
	}, []);
	const lastTickDate = new Date(lastTimestamp * 1000);
	const agoSec = Math.max(0, Math.floor(nowMs / 1000 - lastTimestamp));
	const agoLabel =
		agoSec < 60
			? `${agoSec}s ago`
			: agoSec < 3600
				? `${Math.floor(agoSec / 60)}m ${agoSec % 60}s ago`
				: `${Math.floor(agoSec / 3600)}h ${Math.floor((agoSec % 3600) / 60)}m ago`;

	const [theme, setTheme] = useState<'light' | 'dark'>('dark');

	// Handle authentication
	const handleAuth = () => {
		if (isConnected) {
			disconnect();
		} else {
			authenticate();
		}
	};

	useEffect(() => {
		const root = document.documentElement; // <html>
		if (theme === 'dark') root.classList.add('dark');
		else root.classList.remove('dark');
	}, [theme]);

	return (
		<div>
			<div className="min-h-screen">
				<header className="flex items-center justify-between px-6 pt-6 pb-4">
					<div className="flex items-center gap-4">
						<img
							src={theme === 'dark' ? '/logo.png' : '/light-mode-logo.png'}
							alt="Champaign Compute Exchange Logo"
							className="h-16 w-16 md:h-20 md:w-20"
						/>
						<h1 className="font-extrabold text-3xl md:text-4xl">
							Champaign Compute Exchange
						</h1>
					</div>
					<button
						onClick={handleAuth}
						disabled={isConnecting}
						className="px-6 py-3 text-lg rounded-md border-2 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200"
					>
						{isConnecting ? (
							<>
								<div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
								Connecting...
							</>
						) : isConnected ? (
							<>
								<LogOut size={18} />
								{userDisplayName}
							</>
						) : (
							<>
								<User size={18} />
								Authenticate
							</>
						)}
					</button>
				</header>

				<main className="px-6 space-y-6 pb-16">
					{/* Authentication error message */}
					{authError && (
						<div className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800 flex items-center justify-between">
							<span>Wallet Connection Error: {authError}</span>
							<button
								onClick={clearAuthError}
								className="text-red-400 hover:text-red-600 ml-2"
							>
								×
							</button>
						</div>
					)}

					{/* Two-column layout: Chart on left, sidebar on right */}
					<section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
						{/* Left column - Chart and About (3/5 width on large screens) */}
						<div className="lg:col-span-3 space-y-6">
							<div className="rounded-xl border-2 border-neutral-300 dark:border-neutral-700 p-4">
								{/* Error message for price data */}
								{priceError && (
									<div className="mb-4 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
										Failed to load price data: {priceError}
									</div>
								)}
								<div className="flex items-start justify-between mb-5">
									<div>
										<div className="text-lg md:text-xl font-semibold text-neutral-500">
											H100 SXM Index (USD/hr)
										</div>
										<div
											className={`text-5xl md:text-6xl font-bold ${trend >= 0 ? 'text-cmx-green' : 'text-cmx-red'}`}
										>
											${price.toFixed(4)}
										</div>
									</div>
									<div className="text-sm md:text-lg text-neutral-500 dark:text-neutral-400 leading-tight text-right">
										<div>Last tick: {lastTickDate.toLocaleTimeString()}</div>
										<div className="text-xs md:text-sm">{agoLabel}</div>
									</div>
								</div>
								{isPriceLoading ? (
									<div className="h-48 md:h-64 w-full flex items-center justify-center">
										<div className="flex items-center gap-2 text-neutral-500">
											<div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
											Loading price data...
										</div>
									</div>
								) : (
									<PriceChart data={chartData} />
								)}
							</div>

							{/* About section below chart */}
							<div className="rounded-xl border-2 border-neutral-300 dark:border-neutral-700 p-6">
								<h2 className="text-2xl md:text-3xl font-semibold mb-4">About</h2>
								<p className="text-lg md:text-xl leading-7 md:leading-8 text-neutral-600 dark:text-neutral-300">
									Champaign Compute Exchange (CCX) is a cash-settled forward
									market for NVIDIA H100 SXM GPU compute hours. Traders can take
									long or short positions on the hourly rental price of H100 GPU
									time, allowing speculation on compute pricing trends or hedging
									against future GPU costs. Positions are settled in USD based on
									oracle-fed market rates from major cloud providers.
								</p>
							</div>
						</div>

						{/* Right column - Sidebar (2/5 width on large screens) */}
						<div className="lg:col-span-2 space-y-4">
							{/* Order Board */}
							<OrderBoard />

							{/* Open Order Form */}
							<OpenOrderForm />

							{/* Your Positions */}
							<YourPositions currentPrice={price} />

							{/* Authentication status for trading */}
							{!isConnected && (
								<div className="rounded-xl border-2 border-yellow-300 dark:border-yellow-600 bg-yellow-50/50 dark:bg-yellow-900/20 p-4">
									<div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
										<User size={16} />
										<span className="text-sm font-medium">
											Authenticate to start trading
										</span>
									</div>
								</div>
							)}
						</div>
					</section>
				</main>

				{/* Theme toggle fixed bottom-right, above status bar */}
				<button
					onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
					aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
					className="fixed bottom-16 right-4 px-3 py-2 rounded-md border-2 border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 backdrop-blur"
				>
					{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
				</button>
				<StatusBar rpcStatus="connected" lastOracleTs={lastTimestamp} />
			</div>
		</div>
	);
}

export default App;
