# Realistic Simulated Price System for AI Compute Commoditization

## 🎯 **System Overview**

This system addresses your exact requirements by creating **realistic simulated prices** that are **based on actual market data** from Vast.ai and Akash Network, rather than completely random prices. The simulated prices fluctuate around real market prices with configurable volatility, making them perfect for demonstrating peer-to-peer compute trading.

## 🔍 **Key Features**

### ✅ **Real Market Data Integration**

-   **Fetches real prices** from Vast.ai and Akash Network APIs
-   **Uses median price** as the base for simulations
-   **Updates real market data** every 5 minutes
-   **Fallback mechanism** when real data is unavailable

### ✅ **Realistic Price Simulation**

-   **Volatility around real prices**: 3% to 12% depending on scenario
-   **Price bounds**: 70% to 130% of real market price
-   **Trend components**: Gradual price movements
-   **Market noise**: Realistic short-term fluctuations
-   **Price spikes**: Simulated news events (smaller, more realistic)

### ✅ **Demo Scenarios**

1. **Stable**: 3% volatility, slight upward trend
2. **Volatile**: 8% volatility, no overall trend
3. **Bull**: 5% volatility, strong upward trend
4. **Bear**: 5% volatility, strong downward trend
5. **Extreme**: 12% volatility, pure chaos

## 🏗️ **System Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Real Market    │    │   Realistic      │    │   Oracle        │
│  Data Sources   │───▶│   Simulator      │───▶│   Contract      │
│                 │    │                  │    │                 │
│ • Vast.ai       │    │ • Base: Real     │    │ • Price Storage │
│ • Akash Network │    │   Market Median  │    │ • Staleness     │
└─────────────────┘    │ • Volatility:    │    │   Protection    │
                       │   Configurable   │    │ • Access Control│
                       │ • Bounds: 70-130%│    └─────────────────┘
                       │ • Trends: Real   │
                       └──────────────────┘
```

## 📊 **How It Works**

### 1. **Real Market Data Collection**

```typescript
// Fetches from both sources
const [vastPrice, akashPrice] = await Promise.all([
	getH100SXMPrice(), // Vast.ai API
	getAkashH100SXMPrice(), // Akash API
]);

// Calculates median
const medianPrice = calculateMedian([vastPrice, akashPrice]);
```

### 2. **Realistic Price Generation**

```typescript
// Base price from real market
const basePrice = realMarketPrice ?? fallbackPrice;

// Add realistic components
const newPrice =
	currentPrice +
	trendChange + // Gradual trend
	volatilityChange + // Market noise
	microTrend; // Short-term cycles

// Ensure realistic bounds
const boundedPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, newPrice));
```

### 3. **Demo Control**

```typescript
// Switch scenarios
setDemoScenario('extreme'); // High volatility
setDemoScenario('bull'); // Rising prices
setDemoScenario('stable'); // Low volatility
```

## 🎮 **Demo Usage**

### **Basic Demo**

```bash
# Start the system
bun run entrypoint.ts

# Watch realistic prices update every 30 seconds
# Based on real Vast.ai and Akash data
```

### **Scenario Control**

```bash
# Test different scenarios
bun run testDemo.ts

# This will cycle through all scenarios and show:
# • Real market prices from Vast.ai and Akash
# • Simulated prices based on real data
# • Percentage difference between real and simulated
```

### **Real-Time Monitoring**

The system logs:

-   Real market prices: `Vast: $1.8002, Akash: $1.1300, Median: $1.4651`
-   Simulated prices: `$1.9046/hour (based on real market: $1.4651/hour)`
-   Price differences and trends

## 🔄 **Trading System Logic**

### **Peer-to-Peer Trading Demonstration**

1. **Price Discovery**: Oracle provides real-time H100 SXM prices
2. **Long Position**: Trader A bets prices will rise
3. **Short Position**: Trader B bets prices will fall
4. **Settlement**: Based on oracle price at expiration

### **Example Trading Flow**

```
Time 0: Oracle Price = $1.46/hour
├── Trader A: Takes LONG position (expects $1.60+)
└── Trader B: Takes SHORT position (expects $1.30-)

Time 30s: Oracle Price = $1.90/hour (Bull scenario)
├── Trader A: PROFIT (price rose 30%)
└── Trader B: LOSS (price rose instead of fell)

Time 60s: Oracle Price = $1.87/hour (Bear scenario)
├── Trader A: Still PROFIT (price above entry)
└── Trader B: Still LOSS (price above entry)
```

## 🎯 **Addressing Your Requirements**

### ✅ **Not Completely Random**

-   **Real base prices** from Vast.ai and Akash
-   **Realistic volatility** around actual market prices
-   **Bounded fluctuations** (70% to 130% of real price)

### ✅ **Reflects Reality**

-   **Actual market data** as foundation
-   **Realistic price ranges** for H100 SXM
-   **Market-appropriate volatility** levels

### ✅ **Frequent Price Changes**

-   **30-second updates** for demo effect
-   **Multiple scenarios** showing different market conditions
-   **Real-time blockchain updates**

### ✅ **Peer-to-Peer Trading**

-   **Oracle provides** single source of truth
-   **Traders can take** long/short positions
-   **Settlement based** on oracle prices

## 📈 **Demo Scenarios Explained**

### **Stable Market (3% volatility)**

-   **Use Case**: Show predictable compute pricing
-   **Demo**: "Here's what stable compute markets look like"
-   **Trading**: Low-risk, predictable returns

### **Volatile Market (8% volatility)**

-   **Use Case**: Demonstrate price discovery
-   **Demo**: "Prices fluctuate as supply/demand changes"
-   **Trading**: Higher risk, higher potential returns

### **Bull Market (5% volatility, upward trend)**

-   **Use Case**: Show rising compute demand
-   **Demo**: "AI boom drives compute prices up"
-   **Trading**: Long positions profitable

### **Bear Market (5% volatility, downward trend)**

-   **Use Case**: Show falling compute demand
-   **Demo**: "Market correction in compute prices"
-   **Trading**: Short positions profitable

### **Extreme Volatility (12% volatility)**

-   **Use Case**: Demonstrate market stress
-   **Demo**: "This is what happens during compute shortages"
-   **Trading**: High risk, high reward

## 🔧 **Technical Implementation**

### **Real Market Integration**

```typescript
// Fetches real prices every 5 minutes
private async updateRealMarketPrice(): Promise<void> {
    const realPrice = await this.fetchRealMarketPrice();
    if (realPrice !== null) {
        this.realMarketPrice = realPrice;
        this.lastRealPriceUpdate = now;
    }
}
```

### **Realistic Bounds**

```typescript
// Ensures prices stay realistic
const minPrice = basePrice * 0.7; // 70% of real price
const maxPrice = basePrice * 1.3; // 130% of real price
newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
```

### **Configurable Volatility**

```typescript
// Different volatility levels per scenario
const volatilityChange = (Math.random() - 0.5) * this.config.volatility * basePrice;
```

## 🎬 **Demo Script**

### **Opening (1 minute)**

"Today we're demonstrating the commoditization of AI compute. Our oracle tracks real H100 SXM prices from Vast.ai and Akash Network, and we simulate realistic market conditions for trading."

### **Demo Flow (3 minutes)**

1. **Stable Market** (30s): "Here's a stable compute market"
2. **Volatile Market** (30s): "Now let's see some volatility"
3. **Bull Market** (30s): "Prices are rising due to AI demand"
4. **Bear Market** (30s): "Prices are falling as supply increases"
5. **Extreme Volatility** (30s): "This is market stress"

### **Trading Demo (2 minutes)**

"Watch how traders can take positions:

-   Long when they expect prices to rise
-   Short when they expect prices to fall
-   Settlement based on our oracle prices"

### **Closing (1 minute)**

"This enables peer-to-peer compute trading, risk management, and new DeFi products for the AI compute market."

## ✅ **System Status**

-   ✅ **Real market data integration** working
-   ✅ **Realistic price simulation** working
-   ✅ **Multiple demo scenarios** working
-   ✅ **Blockchain oracle updates** working
-   ✅ **Demo controls** working
-   ✅ **Comprehensive logging** working

The system is **production-ready for demos** and provides exactly what you need to showcase realistic AI compute commoditization! 🚀
