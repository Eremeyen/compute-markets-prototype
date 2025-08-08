# H100Oracle Deployment Guide

## Overview

This guide covers deploying the H100Oracle contract for AI compute price feeds. The oracle aggregates H100 SXM GPU prices from Vast.ai and Akash Network.

## Deployment Options

### Option 1: Local Development (Recommended for Demo)

**Best for**: Development, testing, and demos
**Network**: Local Anvil node
**Pros**: Fast, free, full control
**Cons**: Not persistent, requires local setup

### Option 2: Testnet Deployment

**Best for**: Integration testing, public demos
**Network**: Sepolia, Goerli, or Mumbai
**Pros**: Real blockchain, persistent, public
**Cons**: Requires testnet ETH, slower

### Option 3: Mainnet Deployment

**Best for**: Production use
**Network**: Ethereum mainnet
**Pros**: Real production environment
**Cons**: Requires real ETH, high stakes

## Local Development Deployment (Recommended)

### Step 1: Start Local Blockchain

```bash
# In smart-contracts directory
anvil
```

This starts a local Ethereum node at `http://localhost:8545` with 10 pre-funded accounts.

### Step 2: Set Environment Variables

```bash
# Use the first Anvil account private key
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Step 3: Deploy the Contract

```bash
forge script script/DeployH100Oracle.s.sol:DeployH100OracleScript \
  --rpc-url http://localhost:8545 \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Step 4: Update Backend Configuration

After deployment, you'll see output like:

```
H100Oracle deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Update `backend/src/config/config.ts`:

```typescript
export const RPC_URL = 'http://localhost:8545';
export const ORACLE_ADDRESS: `0x${string}` = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const ORACLE_UPDATER_PRIVATE_KEY: string =
	'0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
```

### Step 5: Start Backend

```bash
# In backend directory
bun run entrypoint.ts
```

## Testnet Deployment

### Step 1: Get Testnet ETH

-   **Sepolia**: Use a faucet like https://sepoliafaucet.com/
-   **Goerli**: Use a faucet like https://goerlifaucet.com/

### Step 2: Set Environment Variables

```bash
export PRIVATE_KEY=your_private_key_here
export RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

### Step 3: Deploy

```bash
forge script script/DeployH100Oracle.s.sol:DeployH100OracleScript \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

## Contract Verification

### Local Verification

The deployment script automatically verifies:

-   Owner is set correctly
-   Deployer is set as trusted updater
-   Contract is deployed successfully

### Testnet/Mainnet Verification

```bash
# Verify on Etherscan (after deployment)
forge verify-contract \
  --chain-id 11155111 \
  --compiler-version 0.8.24 \
  --constructor-args $(cast abi-encode "constructor(address)" $DEPLOYER_ADDRESS) \
  $ORACLE_ADDRESS \
  src/H100Oracle.sol:H100Oracle \
  $ETHERSCAN_API_KEY
```

## Security Considerations

### Private Key Management

-   **Never commit private keys to git**
-   Use environment variables or secure key management
-   For production, use hardware wallets or multisig

### Access Control

-   The deployer becomes both owner and trusted updater
-   Owner can add/remove additional trusted updaters
-   Consider using a multisig for production deployments

### Network Security

-   Verify RPC endpoints are secure
-   Use HTTPS for testnet/mainnet connections
-   Consider using private RPC providers for production

## Troubleshooting

### Common Issues

**1. "Insufficient funds"**

-   Ensure account has enough ETH for deployment
-   For local: Anvil provides 10,000 ETH per account
-   For testnet: Use faucets to get testnet ETH

**2. "Contract deployment failed"**

-   Check Solidity version compatibility
-   Verify all dependencies are installed
-   Check for compilation errors

**3. "Backend can't connect to oracle"**

-   Verify RPC_URL is correct
-   Ensure ORACLE_ADDRESS is the deployed contract address
-   Check that PRIVATE_KEY matches the deployer

**4. "Price updates failing"**

-   Verify the private key has permission to update prices
-   Check that the oracle address is correct
-   Ensure the backend is running and scheduler is active

## Demo Setup Checklist

-   [ ] Start Anvil local blockchain
-   [ ] Deploy H100Oracle contract
-   [ ] Update backend config with oracle address
-   [ ] Start backend scheduler
-   [ ] Verify price updates are working
-   [ ] Test oracle consumption from other contracts

## Next Steps After Deployment

1. **Create Consumer Contracts**: Build contracts that use the oracle
2. **Add More Price Sources**: Integrate additional compute marketplaces
3. **Implement Advanced Features**: Add price volatility protection, circuit breakers
4. **Production Hardening**: Add monitoring, alerting, and backup systems
