import { getH100SXMPrice, getAkashH100SXMPrice } from './getPrice';
import { createWalletClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import cron from 'node-cron';
import { logger } from './config/logger';
import {
    CRON_EXPR,
    ORACLE_ADDRESS,
    ORACLE_UPDATER_PRIVATE_KEY,
    RPC_URL,
    LOCAL_CHAIN,
} from './config/config';

import { RealisticSimulatedPriceGenerator, DEFAULT_REALISTIC_SCENARIO, REALISTIC_DEMO_SCENARIOS } from './realisticSimulatedPrices';

type PriceWithSource = { source: 'vast' | 'akash'; price: number };

const toFixedPoint = (value: number): bigint => {
	// 1e18 fixed-point
	return BigInt(Math.round(value * 1e18));
};

const median = (values: number[]): number | null => {
	const xs = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
	const n = xs.length;
	if (n === 0) return null;
	const mid = Math.floor(n / 2);
	return n % 2 === 1 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
};

// Mirror of on-chain enum PriceSource (Unknown=0, VastAI=1, Akash=2, Combined=3, Manual=4, Simulated=5)
const PriceSource = {
	Unknown: 0,
	VastAI: 1,
	Akash: 2,
	Combined: 3,
    Manual: 4,
    Simulated: 5,
} as const;

// Optional realistic simulated price generator (injected)
let realisticPriceGenerator: RealisticSimulatedPriceGenerator | null = null;

async function publishPriceToOracle(price: number, source: number): Promise<void> {
	if (!ORACLE_ADDRESS || !ORACLE_UPDATER_PRIVATE_KEY) {
		logger.warn(
			`Oracle publish skipped: set ORACLE_ADDRESS and ORACLE_UPDATER_PRIVATE_KEY constants.`,
		);
		return;
	}

	const account = privateKeyToAccount(`0x${ORACLE_UPDATER_PRIVATE_KEY.replace(/^0x/, '')}`);
	const wallet = createWalletClient({ account, transport: http(RPC_URL) });

	const priceFixed = toFixedPoint(price);
	const nowSec = Math.floor(Date.now() / 1000);

	// Use Combined as source when aggregating multiple feeds

	await wallet.writeContract({
		address: ORACLE_ADDRESS as `0x${string}`,
		abi: parseAbi(['function updatePrice(uint256 _price, uint256 _ts, uint8 _source)']),
		functionName: 'updatePrice',
		chain: LOCAL_CHAIN,
		args: [priceFixed, BigInt(nowSec), source],

	});

	logger.info(`Published price ${price} (fixed ${priceFixed}) at ts=${nowSec}`);
}

export const publishMedianPrice = async (): Promise<void> => {
    // For demo: use realistic simulated prices based on real market data
    if (realisticPriceGenerator) {
		const simulatedPrice = await realisticPriceGenerator.getCurrentPrice();
		const realMarketPrice = realisticPriceGenerator.getRealMarketPrice();

		if (realMarketPrice) {
			logger.info(`Using realistic simulated price: $${simulatedPrice.toFixed(4)}/hour (based on real market: $${realMarketPrice.toFixed(4)}/hour)`);
		} else {
			logger.info(`Using realistic simulated price: $${simulatedPrice.toFixed(4)}/hour (fallback mode)`);
		}

        await publishPriceToOracle(simulatedPrice, PriceSource.Simulated);
		return;
	}

	// Fallback to real prices if simulation is not enabled
	const tasks: Promise<PriceWithSource | null>[] = [
		(async () => {
			const p = await getH100SXMPrice();
			return p == null ? null : { source: 'vast', price: p };
		})(),
		(async () => {
			const p = await getAkashH100SXMPrice();
			return p == null ? null : { source: 'akash', price: p };
		})(),
	];

	const results = await Promise.all(tasks);
	const prices = results.filter((x): x is PriceWithSource => x !== null).map((x) => x.price);
	const m = median(prices);
	if (m == null) {
		logger.warn(`No prices available to publish.`);
		return;
	}

	await publishPriceToOracle(m, PriceSource.Combined);
};

export const startPriceScheduler = (
  cronExpr = CRON_EXPR,
  simulator: RealisticSimulatedPriceGenerator | null = null,
): void => {
  // Inject simulator if provided
  realisticPriceGenerator = simulator;
  if (realisticPriceGenerator) {
    logger.info('Realistic simulated price generator enabled');
  }

	cron.schedule(cronExpr, () => {
		publishMedianPrice().catch((err) => logger.error(`publishMedianPrice failed: ${err}`));
	});
	logger.info(`Price scheduler started (cron: ${cronExpr})`);
};

// Demo control functions
export const setDemoScenario = (scenario: keyof typeof REALISTIC_DEMO_SCENARIOS): void => {
	if (realisticPriceGenerator) {
		realisticPriceGenerator.updateConfig(REALISTIC_DEMO_SCENARIOS[scenario]);
		logger.info(`Demo scenario changed to: ${scenario}`);
	}
};

export const getCurrentSimulatedPrice = async (): Promise<number | null> => {
	return realisticPriceGenerator ? await realisticPriceGenerator.getCurrentPrice() : null;
};

export const getRealMarketPrice = (): number | null => {
	return realisticPriceGenerator ? realisticPriceGenerator.getRealMarketPrice() : null;
};

export const refreshRealMarketPrice = async (): Promise<void> => {
	if (realisticPriceGenerator) {
		await realisticPriceGenerator.refreshRealMarketPrice();
	}
};

if (import.meta.main) {
	startPriceScheduler();
}
