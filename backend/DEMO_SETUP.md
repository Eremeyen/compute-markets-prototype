# H100 Oracle Demo Setup Guide

## 🎯 Demo Overview

This demo showcases a **decentralized AI compute price oracle** with simulated price feeds that demonstrate the potential for peer-to-peer compute trading. The system simulates volatile H100 SXM GPU prices to show how DeFi protocols could trade compute as a commodity.

## 🚀 Quick Start

### 1. Deploy the Oracle Contract

```bash
# In smart-contracts directory
cd smart-contracts

# Start local blockchain
anvil

# In another terminal, deploy the contract
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
forge script script/DeployH100Oracle.s.sol:DeployH100OracleScript \
  --rpc-url http://localhost:8545 \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### 2. Update Backend Configuration

Copy the deployed oracle address from the deployment output and update `backend/src/config/config.ts`:

```typescript
export const ORACLE_ADDRESS: `0x${string}` | '' = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
```

### 3. Start the Backend

```bash
# In backend directory
cd backend
bun run entrypoint.ts
```

The backend will start publishing simulated prices every 30 seconds to the oracle contract.

## 🎭 Demo Scenarios

The system includes 5 pre-configured price scenarios:

### Stable Market

-   **Base Price**: $2.50/hour
-   **Volatility**: 5%
-   **Trend**: Slight upward
-   **Updates**: Every 5 seconds
-   **Use Case**: Show stable compute pricing

### Volatile Market (Default)

-   **Base Price**: $2.50/hour
-   **Volatility**: 15%
-   **Trend**: No overall trend
-   **Updates**: Every 3 seconds
-   **Use Case**: Demonstrate price discovery

### Bull Market

-   **Base Price**: $2.50/hour
-   **Volatility**: 8%
-   **Trend**: Strong upward
-   **Updates**: Every 4 seconds
-   **Use Case**: Show rising compute demand

### Bear Market

-   **Base Price**: $2.50/hour
-   **Volatility**: 8%
-   **Trend**: Strong downward
-   **Updates**: Every 4 seconds
-   **Use Case**: Show falling compute demand

### Extreme Volatility

-   **Base Price**: $2.50/hour
-   **Volatility**: 25%
-   **Trend**: No trend, pure chaos
-   **Updates**: Every 2 seconds
-   **Use Case**: Demonstrate extreme market conditions

## 🎮 Demo Controls

### Switch Scenarios

```bash
# List available scenarios
bun run src/demoControl.ts list

# Switch to a specific scenario
bun run src/demoControl.ts switch volatile
bun run src/demoControl.ts switch extreme
bun run src/demoControl.ts switch bull

# Get current price
bun run src/demoControl.ts price

# Run automated demo sequence
bun run src/demoControl.ts demo
```

### Programmatic Control

```typescript
import { DemoController } from './src/demoControl';

// Switch scenarios
DemoController.switchScenario('extreme');
DemoController.switchScenario('stable');

// Get current price
const price = DemoController.getCurrentPrice();
console.log(`Current price: $${price}/hour`);
```

## 📊 Demo Use Cases

### 1. Compute Futures Trading

Show how traders could:

-   Take long positions when prices are expected to rise
-   Take short positions when prices are expected to fall
-   Hedge against compute cost fluctuations

### 2. Compute-Backed Loans

Demonstrate:

-   Using compute hours as collateral
-   Dynamic collateral valuation based on oracle prices
-   Liquidation mechanisms when prices fall

### 3. Automated Arbitrage

Show:

-   Cross-marketplace price differences
-   Automated trading between Vast.ai and Akash
-   Risk-free profit opportunities

### 4. Compute Insurance

Illustrate:

-   Hedging against compute price spikes
-   Insurance products for compute consumers
-   Risk management for compute providers

## 🔧 Technical Details

### Price Simulation Features

-   **Realistic Volatility**: Simulates market noise and price swings
-   **Trend Components**: Gradual price movements over time
-   **Micro-trends**: Short-term cyclical patterns
-   **Price Spikes**: Random events simulating news or demand shocks
-   **Bounded Prices**: Prevents unrealistic price levels

### Oracle Integration

-   **Fixed-Point Precision**: 18-decimal precision for financial calculations
-   **Source Tracking**: Tracks price source (Manual for simulated prices)
-   **Staleness Protection**: Reverts if prices are older than 2 hours
-   **Access Control**: Only authorized updaters can modify prices

### Demo Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Simulated      │    │   Backend        │    │   Oracle        │
│  Price Gen      │───▶│   Scheduler      │───▶│   Contract      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
   Price Scenarios         Blockchain              Smart Contracts
   (Stable, Volatile,      Transactions           (Consumers)
    Bull, Bear, etc.)                             (Traders, DeFi)
```

## 🎬 Demo Script

### Opening (2 minutes)

1. **Introduction**: "Today we're demonstrating the commoditization of AI compute"
2. **Problem**: "Compute prices are volatile and hard to predict"
3. **Solution**: "We've built a decentralized oracle that tracks H100 SXM prices"

### Demo Flow (5 minutes)

1. **Stable Market** (30 seconds): "Here's a stable compute market"
2. **Volatile Market** (30 seconds): "Now let's see some volatility"
3. **Bull Market** (30 seconds): "Prices are rising due to increased demand"
4. **Bear Market** (30 seconds): "Prices are falling as supply increases"
5. **Extreme Volatility** (30 seconds): "This is what happens during market stress"

### Use Cases (3 minutes)

1. **Futures Trading**: "Traders can take long/short positions"
2. **Collateralized Loans**: "Compute hours can be used as collateral"
3. **Arbitrage**: "Automated trading between marketplaces"
4. **Insurance**: "Hedging against price spikes"

### Closing (1 minute)

1. **Benefits**: "Standardized pricing, reduced risk, new financial products"
2. **Future**: "This enables the next generation of compute DeFi"

## 🔍 Monitoring

### Backend Logs

Watch for:

-   Price updates every 30 seconds
-   Scenario changes
-   Blockchain transaction confirmations
-   Error messages

### Oracle Contract

Monitor:

-   Current price: `oracle.currentPrice()`
-   Last update: `oracle.lastTimestamp()`
-   Price source: `oracle.lastSource()`

### Demo Metrics

Track:

-   Price volatility over time
-   Update frequency
-   Scenario effectiveness
-   System reliability

## 🛠️ Troubleshooting

### Common Issues

1. **Oracle deployment fails**

    - Ensure Anvil is running
    - Check private key format
    - Verify sufficient ETH balance

2. **Backend can't connect**

    - Verify RPC_URL is correct
    - Check oracle address in config
    - Ensure private key matches deployer

3. **Prices not updating**

    - Check backend logs for errors
    - Verify cron schedule
    - Ensure blockchain connectivity

4. **Scenario switching not working**
    - Check demo control script
    - Verify scenario names
    - Monitor backend logs

### Debug Commands

```bash
# Check oracle state
cast call <ORACLE_ADDRESS> "currentPrice()" --rpc-url http://localhost:8545

# Check last update
cast call <ORACLE_ADDRESS> "lastTimestamp()" --rpc-url http://localhost:8545

# Check price source
cast call <ORACLE_ADDRESS> "lastSource()" --rpc-url http://localhost:8545
```

## 🎯 Next Steps

After the demo, consider:

1. **Real Price Integration**: Replace simulated prices with real Vast.ai/Akash data
2. **Consumer Contracts**: Build DeFi protocols that use the oracle
3. **Multi-Asset Support**: Add other GPU types (A100, V100, etc.)
4. **Advanced Features**: Add circuit breakers, volatility protection
5. **Production Deployment**: Deploy to testnet/mainnet

This demo system provides a solid foundation for showcasing the potential of decentralized compute markets!
