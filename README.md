# Champaign Mercantile Exchange: frontiers2025

### Project Overview & Significance

Champaign Mercantile Exchange (CMX) brings a missing piece of market infrastructure to the AI-compute supply chain: a regulated-style, cash-settled forward contract on NVIDIA H100 SXM 80 GB GPU-hours. Today, GPU rental prices can swing 25–50 % in a single quarter, making it almost impossible for model developers to budget training runs or for cloud operators to finance new clusters. Traditional commodities—from crude oil to electricity—solve identical volatility with transparent indices and margin-cleared futures. CMX applies that blueprint to compute.

At the core is a real-time spot index that publishes the median USD per H100 SXM GPU-hour price by aggregating public quotes from Vast.ai, Akash and CoreWeave. Builders and providers can reference one authoritative benchmark instead of scraping dashboards. On top of the index, CMX lists a fully collateralised forward: anyone can open a long or short ticket, post initial margin in USDC, and know that profits and losses are exchanged automatically as the index moves. This converts compute from a bespoke procurement headache into a hedgeable, financeable commodity—unlocking predictable cost curves for AI labs and dependable revenue streams for infrastructure vendors.

Designed with standard clearing-house mechanics, on-chain transparency and a Chainlink-ready oracle pipeline, CMX demonstrates a practical path toward the “commodity-like market for compute” called for in recent U.S. AI policy—moving the idea from white-paper to working marketplace.

### Technical Architecture

**Oracle layer ** – A lightweight Solidity contract (H100Oracle) stores the latest USD per H100 SXM GPU-hour price, pushed every minute by a Bun/TypeScript cron script. The script hits Vast.ai (/api/v0/offers), Akash (/v1/gpu-prices) and CoreWeave pricing pages, filters outliers, takes the median and calls updatePrice(). The oracle accepts multiple signer keys and tags each update with a PriceSource enum for audit transparency.

**Clearing & matching layer ** – A single contract (ForwardEscrow) implements a bulletin-board order book. Either side can open an order (open(side, size, expiry)), escrows 30 % initial margin in USDC, and receives an ID. Any wallet can take the opposite side via take(id). A cron job then calls mark(id) every 30 seconds: the contract pulls latestPrice(), calculates P/L, and shifts USDC credits between the long and short. When block.timestamp ≥ expiry, settle(id) finalises the trade; both parties withdraw remaining margin with withdraw(id).

**Front-end & local stack ** – The UI (Next.js + wagmi) shows a live price chart, an open-order table and per-wallet position cards. Two browser tabs—funded by Anvil’s default accounts—let judges open and match positions; toast notifications highlight every margin move. Everything runs locally: Anvil for the chain, Bun cron for oracle & marks, and ENV toggles to swap between demo jitter and real marketplace quotes. The same contracts can later swap cron for Chainlink Functions, or migrate from Anvil to Sepolia, with no Solidity changes.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.38. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

### To-do List

#### Front-end

- [ ] order book, or similar UI to show price action
- [ ] package context to use in v0 or other front-end context
- [ ] mock data to populate front end
- [ ] chart on FE that shows mock data.
- [ ] figure out porto AUTH. Check out example repos.
- [ ] decide color scheme and name of project

#### SCs

- [ ] logic for calculating how much margin is required
- [ ] logic for expiry of open positions based off of time and invalidation of positions because of price difference since instantiation
- [ ]

#### Demo and Documentation

- [ ] Future Improvements
- [ ] How to run the project
- [ ] Explaining the idea
- [ ] setup of two UIs, one trader who opens, and who matches
- [ ] ideally example other open positions on the UI (explanation that automatic matching is in future improvements, and this might be a form of MEV incentivization)
