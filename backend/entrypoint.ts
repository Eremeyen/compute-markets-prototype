import { startPriceScheduler } from './src/scheduler';
import { RealisticSimulatedPriceGenerator, DEFAULT_REALISTIC_SCENARIO } from './src/realisticSimulatedPrices';

async function main(): Promise<void> {
  console.log('Starting H100 Oracle Price Scheduler...');

  // Choose mode: simulated or real
  // For simulated mode:
  const simulator = new RealisticSimulatedPriceGenerator(DEFAULT_REALISTIC_SCENARIO);
  startPriceScheduler(undefined, simulator);

  // For real mode (no simulation), comment the two lines above and use:
  // startPriceScheduler();

  console.log('Price scheduler started successfully!');
}

main().catch((err) => {
  console.error('Fatal error starting scheduler:', err);
  process.exit(1);
});
