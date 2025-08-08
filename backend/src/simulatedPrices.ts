import { logger } from './config/logger';

export interface SimulatedPriceConfig {
    basePrice: number; // Base price in USD per hour
    volatility: number; // Price volatility (0.1 = 10% swings)
    trend: number; // Price trend (-1 to 1, negative = falling, positive = rising)
    updateIntervalMs: number; // How often to update prices
}

export class SimulatedPriceGenerator {
    private config: SimulatedPriceConfig;
    private currentPrice: number;
    private lastUpdate: number;
    private trend: number;

    constructor(config: SimulatedPriceConfig) {
        this.config = config;
        this.currentPrice = config.basePrice;
        this.lastUpdate = Date.now();
        this.trend = config.trend;
    }

    /**
     * Generate a realistic simulated price for H100 SXM
     * Simulates market volatility, trends, and random fluctuations
     */
    private generatePrice(): number {
        const now = Date.now();
        const timeDelta = (now - this.lastUpdate) / 1000; // seconds
        this.lastUpdate = now;

        // Add trend component (gradual price movement)
        const trendChange = this.trend * this.config.basePrice * 0.001 * timeDelta;

        // Add random volatility (simulates market noise)
        const volatilityChange = (Math.random() - 0.5) * this.config.volatility * this.currentPrice;

        // Add micro-trends (short-term price movements)
        const microTrend = Math.sin(now / 10000) * this.config.basePrice * 0.0005;

        // Calculate new price
        let newPrice = this.currentPrice + trendChange + volatilityChange + microTrend;

        // Ensure price stays within reasonable bounds (50% to 200% of base price)
        const minPrice = this.config.basePrice * 0.5;
        const maxPrice = this.config.basePrice * 2.0;
        newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));

        // Occasionally reverse trend to simulate market cycles
        if (Math.random() < 0.01) { // 1% chance per update
            this.trend = -this.trend * 0.5; // Reverse with reduced intensity
        }

        // Add sudden price spikes/drops (simulates news events)
        if (Math.random() < 0.005) { // 0.5% chance per update
            const spike = (Math.random() - 0.5) * this.config.basePrice * 0.3;
            newPrice += spike;
        }

        this.currentPrice = newPrice;
        return newPrice;
    }

    /**
     * Get the current simulated price
     */
    getCurrentPrice(): number {
        return this.generatePrice();
    }

    /**
     * Update configuration (useful for demo controls)
     */
    updateConfig(newConfig: Partial<SimulatedPriceConfig>): void {
        this.config = { ...this.config, ...newConfig };
        logger.info(`Simulated price config updated: ${JSON.stringify(this.config)}`);
    }

    /**
     * Get current configuration
     */
    getConfig(): SimulatedPriceConfig {
        return { ...this.config };
    }
}

// Pre-configured price scenarios for different demo modes
export const DEMO_SCENARIOS = {
    // Stable market - low volatility, slight upward trend
    stable: {
        basePrice: 2.50, // $2.50 per hour
        volatility: 0.05, // 5% volatility
        trend: 0.1, // Slight upward trend
        updateIntervalMs: 5000, // Update every 5 seconds
    },

    // Volatile market - high volatility, changing trends
    volatile: {
        basePrice: 2.50,
        volatility: 0.15, // 15% volatility
        trend: 0.0, // No overall trend
        updateIntervalMs: 3000, // Update every 3 seconds
    },

    // Bull market - rising prices with moderate volatility
    bull: {
        basePrice: 2.50,
        volatility: 0.08, // 8% volatility
        trend: 0.3, // Strong upward trend
        updateIntervalMs: 4000, // Update every 4 seconds
    },

    // Bear market - falling prices with moderate volatility
    bear: {
        basePrice: 2.50,
        volatility: 0.08, // 8% volatility
        trend: -0.3, // Strong downward trend
        updateIntervalMs: 4000, // Update every 4 seconds
    },

    // Extreme volatility - for dramatic demo effect
    extreme: {
        basePrice: 2.50,
        volatility: 0.25, // 25% volatility
        trend: 0.0, // No trend, pure chaos
        updateIntervalMs: 2000, // Update every 2 seconds
    },
} as const;

// Default scenario for demo
export const DEFAULT_SCENARIO = DEMO_SCENARIOS.volatile; 