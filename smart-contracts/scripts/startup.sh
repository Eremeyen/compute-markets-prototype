#!/bin/bash

# 🚀 H100 Forward Escrow Trading System - Demo Startup Script
# This script sets up everything needed for the live demo

set -e  # Exit on any error

echo "🎯 Starting H100 Forward Escrow Trading System Demo..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "foundry.toml" ]; then
    print_error "Please run this script from the smart-contracts directory"
    exit 1
fi

# Kill any existing anvil processes
print_status "Stopping any existing Anvil instances..."
pkill -f anvil || true
sleep 2

# Start Anvil in the background
print_status "Starting Anvil local blockchain..."
anvil > anvil.log 2>&1 &
ANVIL_PID=$!
sleep 3

# Check if Anvil started successfully
if ! curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545 > /dev/null; then
    print_error "Failed to start Anvil. Check anvil.log for details."
    exit 1
fi

print_success "Anvil started successfully on http://localhost:8545"

# Deploy contracts
print_status "Deploying contracts..."
forge script script/DeployMinimal.s.sol --rpc-url http://localhost:8545 --broadcast --unlocked 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Wait for deployment to complete
sleep 2

# Fund demo accounts with USDC
print_status "Funding demo accounts with USDC..."

# Account 1: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (already funded)
# Account 2: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
cast send --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --unlocked 0x5FbDB2315678afecb367f032d93F642f64180aa3 "mint(address,uint256)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 100000000000

# Approve USDC for trading (Account 1)
print_status "Approving USDC for trading (Account 1)..."
cast send --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --unlocked 0x5FbDB2315678afecb367f032d93F642f64180aa3 "approve(address,uint256)" 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 1000000000000000000

# Approve USDC for trading (Account 2)
print_status "Approving USDC for trading (Account 2)..."
cast send --from 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --unlocked 0x5FbDB2315678afecb367f032d93F642f64180aa3 "approve(address,uint256)" 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 1000000000000000000

# Set initial price using backend scheduler
print_status "Setting initial H100 price using backend scheduler..."
cd ../backend
npm install > /dev/null 2>&1 || print_warning "npm install failed, continuing..."

# Create a simple script to set initial price
cat > set_initial_price.js << 'EOF'
import { createWalletClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { foundry } from 'viem/chains';

const ORACLE_ADDRESS = '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512';
const ORACLE_UPDATER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const RPC_URL = 'http://localhost:8545';

const toFixedPoint = (value) => {
    return BigInt(Math.round(value * 1e18));
};

async function setInitialPrice() {
    const account = privateKeyToAccount(ORACLE_UPDATER_PRIVATE_KEY);
    const wallet = createWalletClient({ account, transport: http(RPC_URL) });

    const price = 2.50; // $2.50 per H100 hour
    const priceFixed = toFixedPoint(price);
    const nowSec = Math.floor(Date.now() / 1000); // Use current timestamp

    try {
        await wallet.writeContract({
            address: ORACLE_ADDRESS,
            abi: parseAbi(['function updatePrice(uint256 _price, uint256 _ts, uint8 _source)']),
            functionName: 'updatePrice',
            chain: foundry,
            args: [priceFixed, BigInt(nowSec), 4], // Manual source
        });
        console.log(`✅ Initial price set: $${price}/hour at timestamp ${nowSec}`);
    } catch (error) {
        console.error(`❌ Failed to set initial price: ${error.message}`);
        process.exit(1);
    }
}

setInitialPrice();
EOF

# Run the price setting script
node set_initial_price.js
rm set_initial_price.js

# Go back to smart-contracts directory
cd ../smart-contracts

# Verify setup
print_status "Verifying setup..."

# Check USDC balances
BALANCE1=$(cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "balanceOf(address)" 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
BALANCE2=$(cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "balanceOf(address)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8)
PRICE=$(cast call 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 "currentPrice()")

print_success "Setup complete! Demo is ready."
echo ""
echo "📊 Contract Addresses:"
echo "  MockUSDC:     0x5FbDB2315678afecb367f032d93F642f64180aa3"
echo "  H100Oracle:   0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
echo "  ForwardEscrow: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
echo ""
echo "👤 Demo Accounts:"
echo "  Account 1: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo "  Account 2: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
echo ""
echo "💰 USDC Balances:"
echo "  Account 1: $BALANCE1"
echo "  Account 2: $BALANCE2"
echo ""
echo "📈 Current H100 Price: $PRICE"
echo ""
echo "🔑 Private Keys:"
echo "  Account 1: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
echo "  Account 2: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
echo ""
echo "🎮 Demo Instructions:"
echo "  1. Connect Account 1 to frontend"
echo "  2. Open a long position (10 H100 hours, 1 hour expiry)"
echo "  3. Switch to Account 2 in another browser/incognito"
echo "  4. View and take the open position"
echo "  5. Watch price updates and PnL changes"
echo ""
echo "🔄 Backend Price Updates:"
echo "  The backend scheduler will automatically update prices every 30 seconds"
echo "  To start the backend: cd ../backend && npm start"
echo ""
echo "🛑 To stop the demo: ./scripts/stop.sh"
echo "📝 Anvil logs: tail -f anvil.log"

# Save demo info to file
cat > demo_info.txt << EOF
DEMO SETUP COMPLETE
==================

Contract Addresses:
- MockUSDC: 0x5FbDB2315678afecb367f032d93F642f64180aa3
- H100Oracle: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
- ForwardEscrow: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

Demo Accounts:
- Account 1: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
- Account 2: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

Private Keys:
- Account 1: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
- Account 2: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

USDC Balances:
- Account 1: $BALANCE1
- Account 2: $BALANCE2

Current H100 Price: $PRICE

Backend Integration:
- Backend will automatically update prices every 30 seconds
- Start backend with: cd ../backend && npm start
EOF

print_success "Demo info saved to demo_info.txt" 