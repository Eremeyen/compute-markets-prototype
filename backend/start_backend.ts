import { startPriceScheduler } from './src/scheduler.ts';

console.log('🚀 Starting H100 Forward Escrow Trading System Backend...');
console.log('📊 Price scheduler will update H100 prices every 30 seconds');
console.log('🛑 Press Ctrl+C to stop');

startPriceScheduler();

// Keep the process running
process.on('SIGINT', () => {
    console.log('\n🛑 Backend stopped');
    process.exit(0);
});
