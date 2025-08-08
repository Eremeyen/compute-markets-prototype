import { setDemoScenario, getCurrentSimulatedPrice, getRealMarketPrice, refreshRealMarketPrice } from './scheduler';
import { REALISTIC_DEMO_SCENARIOS } from './realisticSimulatedPrices';
import { logger } from './config/logger';

export class DemoController {
    /**
     * Switch to a specific demo scenario
     */
    static switchScenario(scenario: keyof typeof REALISTIC_DEMO_SCENARIOS): void {
        setDemoScenario(scenario);
        logger.info(`🎭 Demo scenario switched to: ${scenario}`);
        logger.info(`📊 Scenario config: ${JSON.stringify(REALISTIC_DEMO_SCENARIOS[scenario], null, 2)}`);
    }

    /**
     * Get current simulated price
     */
    static async getCurrentPrice(): Promise<number | null> {
        return await getCurrentSimulatedPrice();
    }

    /**
     * Get current real market price
     */
    static getRealMarketPrice(): number | null {
        return getRealMarketPrice();
    }

    /**
     * Refresh real market price
     */
    static async refreshRealMarketPrice(): Promise<void> {
        await refreshRealMarketPrice();
    }

    /**
     * List all available scenarios
     */
    static listScenarios(): void {
        logger.info('🎭 Available realistic demo scenarios:');
        Object.keys(REALISTIC_DEMO_SCENARIOS).forEach((scenario) => {
            const config = REALISTIC_DEMO_SCENARIOS[scenario as keyof typeof REALISTIC_DEMO_SCENARIOS];
            logger.info(`  • ${scenario}: ${(config.volatility * 100).toFixed(0)}% volatility, ${config.updateIntervalMs}ms updates`);
        });
    }

    /**
     * Run a demo sequence showing different scenarios
     */
    static async runDemoSequence(): Promise<void> {
        logger.info('🎬 Starting realistic demo sequence...');

        const scenarios: (keyof typeof REALISTIC_DEMO_SCENARIOS)[] = ['stable', 'volatile', 'bull', 'bear', 'extreme'];

        for (const scenario of scenarios) {
            logger.info(`🎭 Switching to ${scenario} scenario...`);
            this.switchScenario(scenario);

            // Wait for a few price updates to see the effect
            await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
        }

        logger.info('🎬 Demo sequence completed!');
    }

    /**
     * Show current market status
     */
    static async showMarketStatus(): Promise<void> {
        const simulatedPrice = await this.getCurrentPrice();
        const realMarketPrice = this.getRealMarketPrice();

        logger.info('📊 Current Market Status:');
        if (simulatedPrice !== null) {
            logger.info(`  • Simulated Price: $${simulatedPrice.toFixed(4)}/hour`);
        }
        if (realMarketPrice !== null) {
            logger.info(`  • Real Market Price: $${realMarketPrice.toFixed(4)}/hour`);
            const difference = simulatedPrice !== null ? ((simulatedPrice - realMarketPrice) / realMarketPrice * 100) : 0;
            logger.info(`  • Difference: ${difference.toFixed(2)}%`);
        } else {
            logger.info(`  • Real Market Price: Not available (using fallback)`);
        }
    }
}

// CLI interface for demo control
if (import.meta.main) {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'list':
            DemoController.listScenarios();
            break;

        case 'switch':
            const scenario = args[1] as keyof typeof REALISTIC_DEMO_SCENARIOS;
            if (scenario && scenario in REALISTIC_DEMO_SCENARIOS) {
                DemoController.switchScenario(scenario);
            } else {
                logger.error('Invalid scenario. Use "list" to see available scenarios.');
            }
            break;

        case 'price':
            DemoController.getCurrentPrice().then(price => {
                if (price !== null) {
                    logger.info(`Current simulated price: $${price.toFixed(4)}/hour`);
                } else {
                    logger.error('No simulated price available');
                }
            });
            break;

        case 'real':
            const realPrice = DemoController.getRealMarketPrice();
            if (realPrice !== null) {
                logger.info(`Current real market price: $${realPrice.toFixed(4)}/hour`);
            } else {
                logger.error('No real market price available');
            }
            break;

        case 'refresh':
            DemoController.refreshRealMarketPrice().then(() => {
                logger.info('Real market price refreshed');
            });
            break;

        case 'status':
            DemoController.showMarketStatus();
            break;

        case 'demo':
            DemoController.runDemoSequence();
            break;

        default:
            logger.info('Realistic Demo Control Commands:');
            logger.info('  bun run demoControl.ts list     - List all scenarios');
            logger.info('  bun run demoControl.ts switch <scenario> - Switch to scenario');
            logger.info('  bun run demoControl.ts price    - Get current simulated price');
            logger.info('  bun run demoControl.ts real     - Get current real market price');
            logger.info('  bun run demoControl.ts refresh  - Refresh real market price');
            logger.info('  bun run demoControl.ts status   - Show market status');
            logger.info('  bun run demoControl.ts demo     - Run demo sequence');
            break;
    }
} 