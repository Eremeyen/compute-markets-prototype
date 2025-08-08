import { startPriceScheduler, setDemoScenario, getCurrentSimulatedPrice, getRealMarketPrice } from './src/scheduler';

async function testDemo() {
    console.log('🧪 Testing Realistic Simulated Price System...\n');

    // Start the scheduler
    startPriceScheduler();

    // Wait a moment for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test different scenarios
    const scenarios = ['stable', 'volatile', 'bull', 'bear', 'extreme'] as const;

    for (const scenario of scenarios) {
        console.log(`\n🎭 Testing ${scenario} scenario:`);

        // Switch scenario
        setDemoScenario(scenario);

        // Wait for price generation
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get prices
        const simulatedPrice = await getCurrentSimulatedPrice();
        const realMarketPrice = getRealMarketPrice();

        console.log(`  • Simulated Price: $${simulatedPrice?.toFixed(4) || 'N/A'}/hour`);
        console.log(`  • Real Market Price: $${realMarketPrice?.toFixed(4) || 'N/A'}/hour`);

        if (simulatedPrice && realMarketPrice) {
            const difference = ((simulatedPrice - realMarketPrice) / realMarketPrice * 100);
            console.log(`  • Difference: ${difference.toFixed(2)}%`);
        }
    }

    console.log('\n✅ Demo test completed!');
    console.log('\n📊 System Summary:');
    console.log('• Realistic simulated prices based on actual Vast.ai and Akash data');
    console.log('• Prices fluctuate around real market median with configurable volatility');
    console.log('• 5 different scenarios: stable, volatile, bull, bear, extreme');
    console.log('• Real market prices update every 5 minutes');
    console.log('• Simulated prices update every 30 seconds for demo effect');

    process.exit(0);
}

testDemo().catch(console.error); 