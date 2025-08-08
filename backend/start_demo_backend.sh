#!/bin/bash

# 🔄 H100 Forward Escrow Trading System - Backend Demo Startup Script
# This script starts the backend scheduler for automatic price updates

set -e  # Exit on any error

echo "🔄 Starting H100 Forward Escrow Trading System Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    exit 1 # Exit on error
}

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the backend directory"
fi

# Check if Anvil is running
if ! curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545 > /dev/null; then
    print_error "Anvil is not running. Please start the demo first with ./scripts/startup.sh from the smart-contracts directory"
fi

print_success "Anvil is running on http://localhost:8545"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing backend dependencies..."
    npm install
fi

# Install tsx if not available
if ! command -v npx &> /dev/null; then
    print_error "npx is not available. Please install Node.js and npm."
fi

print_status "Starting backend scheduler with tsx..."
print_success "Backend will update H100 prices every 30 seconds"
echo ""
echo "📊 Backend Features:"
echo "  - Automatic price updates every 30 seconds"
echo "  - Realistic simulated price movements"
echo "  - Integration with H100Oracle contract"
echo "  - Real market price integration"
echo ""
echo "🎮 Demo Integration:"
echo "  - Prices will automatically update in the trading system"
echo "  - PnL will change as prices move"
echo "  - Frontend can watch for price changes"
echo ""
echo "🛑 To stop backend: Press Ctrl+C"
echo "📝 Backend logs will show price updates"

# Start the backend with tsx
npx tsx start_backend.ts 