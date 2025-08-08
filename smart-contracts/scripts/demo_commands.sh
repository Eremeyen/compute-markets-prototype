#!/bin/bash

# 🎮 H100 Forward Escrow Trading System - Live Demo Commands
# This script contains all the commands needed for the live demo

echo "🎮 H100 Forward Escrow Trading System - Live Demo Commands"
echo "=========================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${PURPLE}[STEP $1]${NC} $2"
}

print_command() {
    echo -e "${YELLOW}Command:${NC} $1"
}

print_result() {
    echo -e "${GREEN}Result:${NC} $1"
}

print_note() {
    echo -e "${BLUE}Note:${NC} $1"
}

echo "📋 Demo Setup (Run this first):"
echo "  ./scripts/startup.sh"
echo ""

echo "🎯 Live Demo Steps:"
echo "=================="

print_step "1" "Check current setup"
print_command "cat demo_info.txt"
echo ""

print_step "2" "Check current H100 price"
print_command "cast call 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 'currentPrice()'"
print_note "Should show current price in wei (1e18 format)"
echo ""

print_step "3" "Check USDC balances"
print_command "cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 'balanceOf(address)' 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
print_command "cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 'balanceOf(address)' 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
echo ""

print_step "4" "Open a long position (Account 1)"
print_command "cast send --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --unlocked 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'open(uint8,uint256,uint256)' 0 10 3600"
print_note "Opens long position: 10 H100 hours, 1 hour expiry"
echo ""

print_step "5" "Check open orders"
print_command "cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'getOpenOrders()'"
print_note "Should show position ID 0"
echo ""

print_step "6" "View position details"
print_command "cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'positions(uint256)' 0"
print_note "Shows position details: long address, short address, size, entry price, etc."
echo ""

print_step "7" "Take the position (Account 2)"
print_command "cast send --from 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --unlocked 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'take(uint256)' 0"
print_note "Account 2 takes the short side of position 0"
echo ""

print_step "8" "Check position is now filled"
print_command "cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'positions(uint256)' 0"
print_note "Should show both long and short addresses filled"
echo ""

print_step "9" "Check open orders (should be empty)"
print_command "cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'getOpenOrders()'"
print_note "Should return empty array"
echo ""

print_step "10" "Update price (simulate price movement)"
print_command "CURRENT_TIMESTAMP=\$(cast block latest | grep timestamp | awk '{print \$2}' | sed 's/(.*//')"
print_command "PAST_TIMESTAMP=\$((CURRENT_TIMESTAMP - 30))"
print_command "cast send --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --unlocked 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 'updatePrice(uint256,uint256,uint8)' 3000000000000000000 \$PAST_TIMESTAMP 4"
print_note "Updates price to $3.00 (long position wins)"
echo ""

print_step "11" "Mark position (update PnL)"
print_command "cast send --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --unlocked 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'mark(uint256)' 0"
print_note "Updates PnL based on new price"
echo ""

print_step "12" "Check credit balances"
print_command "cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'credit(address)' 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
print_command "cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'credit(address)' 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
print_note "Long should have increased credit, short should have decreased"
echo ""

print_step "13" "Wait for expiry (optional - warp time)"
print_command "cast rpc evm_increaseTime 3601 --rpc-url http://localhost:8545"
print_command "cast rpc evm_mine --rpc-url http://localhost:8545"
print_note "Advances time by 1 hour + 1 second"
echo ""

print_step "14" "Settle position"
print_command "cast send --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --unlocked 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'settle(uint256)' 0"
print_note "Finalizes the position"
echo ""

print_step "15" "Withdraw funds"
print_command "cast send --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --unlocked 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'withdraw(uint256)' 0"
print_note "Long withdraws profits"
echo ""

echo ""
echo "🎮 Frontend Demo Flow:"
echo "====================="
echo "1. Connect Account 1 (0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)"
echo "2. Open long position via UI"
echo "3. Switch to Account 2 (0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d)"
echo "4. View open orders and take position"
echo "5. Watch real-time price updates and PnL changes"
echo ""

echo "🛑 To stop demo:"
echo "  ./scripts/stop.sh"
echo ""

echo "📝 Useful monitoring commands:"
echo "  tail -f anvil.log                    # Watch Anvil logs"
echo "  cast block latest                    # Check current block"
echo "  cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'positions(uint256)' 0  # Check position"
echo "  cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'getOpenOrders()'      # Check open orders" 