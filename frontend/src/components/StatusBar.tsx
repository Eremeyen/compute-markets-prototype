type Props = {
	rpcStatus: 'connected' | 'disconnected' | 'connecting';
	lastOracleTs?: number; // unix seconds
};

export function StatusBar({ rpcStatus, lastOracleTs }: Props) {
	const now = Date.now();
	const agoSec = lastOracleTs ? Math.max(0, Math.floor(now / 1000 - lastOracleTs)) : null;
	const agoLabel =
		agoSec == null
			? 'n/a'
			: agoSec < 60
				? `${agoSec}s`
				: agoSec < 3600
					? `${Math.floor(agoSec / 60)}m ${agoSec % 60}s`
					: `${Math.floor(agoSec / 3600)}h ${Math.floor((agoSec % 3600) / 60)}m`;

	const rpcColor =
		rpcStatus === 'connected'
			? 'text-cmx-green'
			: rpcStatus === 'connecting'
				? 'text-cmx-gold'
				: 'text-cmx-red';

	return (
		<div className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur px-4 py-2 text-xs md:text-sm flex items-center justify-between">
			<div>
				<span className="text-neutral-500">RPC:</span>{' '}
				<span className={`${rpcColor}`}>{rpcStatus}</span>
			</div>
			<div className="text-neutral-500">
				Last oracle pulse:{' '}
				<span className="text-neutral-800 dark:text-neutral-200">{agoLabel}</span>
			</div>
		</div>
	);
}
