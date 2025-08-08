#!/bin/bash

# 🛑 H100 Forward Escrow Trading System - Demo Stop Script

echo "🛑 Stopping H100 Forward Escrow Trading System Demo..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Kill Anvil process
print_status "Stopping Anvil..."
pkill -f anvil || true

# Wait a moment for cleanup
sleep 2

# Check if Anvil is still running
if pgrep -f anvil > /dev/null; then
    print_status "Force killing Anvil..."
    pkill -9 -f anvil || true
fi

print_success "Demo stopped successfully!"
echo ""
echo "🧹 Cleanup complete. You can now:"
echo "  - Start a new demo: ./scripts/startup.sh"
echo "  - View logs: cat anvil.log"
echo "  - Check demo info: cat demo_info.txt" 