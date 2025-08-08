import { logger } from './config/logger';
import { getH100SXMPrice, getAkashH100SXMPrice } from './getPrice';

export interface RealisticPriceConfig {
    volatility: number; // Price volatility around real market price (0.1 = 10% swings)
    trend: number; // Price trend (-1 to 1, negative = falling, positive = rising)
    updateIntervalMs: number; // How often to update prices
    fallbackBasePrice: number; // Fallback price if real data unavailable
}

export class RealisticSimulatedPriceGenerator {
    private config: RealisticPriceConfig;
    private currentPrice: number;
    private lastUpdate: number;
    private trend: number;
    private realMarketPrice: number | null;
    private lastRealPriceUpdate: number;

    constructor(config: RealisticPriceConfig) {
        this.config = config;
        this.currentPrice = config.fallbackBasePrice;
        this.lastUpdate = Date.now();
        this.trend = config.trend;
        this.realMarketPrice = null;
        this.lastRealPriceUpdate = 0;
    }

    /**
     * Fetch real market prices from Vast.ai and Akash
     * Returns the median price, or null if no data available
     */
    private async fetchRealMarketPrice(): Promise<number | null> {
        try {
            const [vastPrice, akashPrice] = await Promise.all([
                getH100SXMPrice(),
                getAkashH100SXMPrice(),
            ]);

            const prices = [vastPrice, akashPrice].filter((p): p is number => p !== null);

            if (prices.length === 0) {
                logger.warn('No real market prices available');
                return null;
            }

            // Calculate median of available prices
            const sortedPrices = prices.sort((a, b) => a - b);
            const medianPrice = sortedPrices.length % 2 === 1
                ? sortedPrices[Math.floor(sortedPrices.length / 2)]
                : (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2;

            logger.info(`Real market prices - Vast: $${vastPrice?.toFixed(4) || 'N/A'}, Akash: $${akashPrice?.toFixed(4) || 'N/A'}, Median: $${medianPrice.toFixed(4)}`);

            return medianPrice;
        } catch (error) {
            logger.error(`Error fetching real market prices: ${error}`);
            return null;
        }
    }

    /**
     * Update real market price (called periodically)
     */
    private async updateRealMarketPrice(): Promise<void> {
        const now = Date.now();
        // Update real market price every 5 minutes
        if (now - this.lastRealPriceUpdate > 5 * 60 * 1000) {
            const realPrice = await this.fetchRealMarketPrice();
            if (realPrice !== null) {
                this.realMarketPrice = realPrice;
                this.lastRealPriceUpdate = now;
                logger.info(`Updated real market base price: $${realPrice.toFixed(4)}/hour`);
            }
        }
    }

    /**
     * Generate a realistic simulated price based on real market data
     */
    private async generateRealisticPrice(): Promise<number> {
        await this.updateRealMarketPrice();

        // Use real market price as base, or fallback if unavailable
        const basePrice = this.realMarketPrice ?? this.config.fallbackBasePrice;

        const now = Date.now();
        const timeDelta = (now - this.lastUpdate) / 1000; // seconds
        this.lastUpdate = now;

        // Add trend component (gradual price movement around real market price)
        const trendChange = this.trend * basePrice * 0.001 * timeDelta;

        // Add realistic volatility (market noise around real price)
        const volatilityChange = (Math.random() - 0.5) * this.config.volatility * basePrice;

        // Add micro-trends (short-term cyclical patterns)
        const microTrend = Math.sin(now / 10000) * basePrice * 0.0005;

        // Calculate new price
        let newPrice = this.currentPrice + trendChange + volatilityChange + microTrend;

        // Ensure price stays within realistic bounds (70% to 130% of real market price)
        const minPrice = basePrice * 0.7;
        const maxPrice = basePrice * 1.3;
        newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));

        // Occasionally reverse trend to simulate market cycles
        if (Math.random() < 0.01) { // 1% chance per update
            this.trend = -this.trend * 0.5; // Reverse with reduced intensity
        }

        // Add sudden price spikes/drops (simulates news events, but smaller than before)
        if (Math.random() < 0.003) { // 0.3% chance per update
            const spike = (Math.random() - 0.5) * basePrice * 0.15; // Smaller spikes
            newPrice += spike;
        }

        this.currentPrice = newPrice;
        return newPrice;
    }

    /**
     * Get the current realistic simulated price
     */
    async getCurrentPrice(): Promise<number> {
        return await this.generateRealisticPrice();
    }

    /**
     * Get the current real market price (if available)
     */
    getRealMarketPrice(): number | null {
        return this.realMarketPrice;
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<RealisticPriceConfig>): void {
        this.config = { ...this.config, ...newConfig };
        logger.info(`Realistic price config updated: ${JSON.stringify(this.config)}`);
    }

    /**
     * Get current configuration
     */
    getConfig(): RealisticPriceConfig {
        return { ...this.config };
    }

    /**
     * Force refresh of real market price
     */
    async refreshRealMarketPrice(): Promise<void> {
        this.lastRealPriceUpdate = 0; // Force update
        await this.updateRealMarketPrice();
    }
}

// Pre-configured realistic scenarios
export const REALISTIC_DEMO_SCENARIOS = {
    // Stable market - low volatility around real prices
    stable: {
        volatility: 0.03, // 3% volatility around real price
        trend: 0.05, // Slight upward trend
        updateIntervalMs: 5000, // Update every 5 seconds
        fallbackBasePrice: 2.50, // Fallback if no real data
    },

    // Volatile market - moderate volatility around real prices
    volatile: {
        volatility: 0.08, // 8% volatility around real price
        trend: 0.0, // No overall trend
        updateIntervalMs: 3000, // Update every 3 seconds
        fallbackBasePrice: 2.50,
    },

    // Bull market - rising prices with moderate volatility
    bull: {
        volatility: 0.05, // 5% volatility around real price
        trend: 0.2, // Moderate upward trend
        updateIntervalMs: 4000, // Update every 4 seconds
        fallbackBasePrice: 2.50,
    },

    // Bear market - falling prices with moderate volatility
    bear: {
        volatility: 0.05, // 5% volatility around real price
        trend: -0.2, // Moderate downward trend
        updateIntervalMs: 4000, // Update every 4 seconds
        fallbackBasePrice: 2.50,
    },

    // High volatility - for dramatic demo effect, but still realistic
    extreme: {
        volatility: 0.12, // 12% volatility around real price
        trend: 0.0, // No trend, pure volatility
        updateIntervalMs: 2000, // Update every 2 seconds
        fallbackBasePrice: 2.50,
    },
} as const;

// Default scenario for demo
export const DEFAULT_REALISTIC_SCENARIO = REALISTIC_DEMO_SCENARIOS.volatile; 