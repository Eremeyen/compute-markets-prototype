# 🎯 H100 Forward Escrow Trading System - Complete Live Demo Guide

## 🚀 Quick Start Commands

### 1. Setup Demo Environment

```bash
cd smart-contracts
./scripts/startup.sh
```

### 2. Start Backend (Optional - for automatic price updates)

In a separate terminal.

```bash
cd backend
./start_demo_backend.sh
```

### 3. Stop Demo

```bash
# Stop backend: Ctrl+C in backend terminal
# Stop Anvil:
cd smart-contracts
./scripts/stop.sh
```

## 📊 Contract Addresses

-   **MockUSDC**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
-   **H100Oracle**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
-   **ForwardEscrow**: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`

## 👤 Demo Accounts

### Account 1 (Long Trader)

-   **Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
-   **Private Key**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

### Account 2 (Short Trader)

-   **Address**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
-   **Private Key**: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

## 🎮 Complete Live Demo Walkthrough

### Phase 1: Setup (Already Done by startup.sh)

1. ✅ Start Anvil blockchain
2. ✅ Deploy all contracts
3. ✅ Fund accounts with USDC
4. ✅ Set initial H100 price ($2.50)
5. ✅ Approve USDC for trading

### Phase 2: Backend Integration (Optional)

1. ✅ Start backend scheduler
2. ✅ Automatic price updates every 30 seconds
3. ✅ Realistic simulated price movements

### Phase 3: Manual Demo Commands

#### Step 1: Verify Setup

```bash
# Check Account 1 USDC balance
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 'balanceOf(address)' 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Check current H100 price
cast call 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 'currentPrice()'

# Check open orders (should be empty)
cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'getOpenOrders()'
```

#### Step 2: Account 1 Opens Long Position

```bash
# Open long position: 10 H100 hours, 1 hour expiry
cast send --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --unlocked 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'open(uint8,uint256,uint256)' 0 10000000000000000000 3600

# Verify position is open
cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'getOpenOrders()'
```

#### Step 3: Account 2 Takes the Position

```bash
# Take the open position (becomes short side)
cast send --from 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --unlocked 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'take(uint256)' 0

# Verify position is filled (open orders should be empty)
cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'getOpenOrders()'

# Check position details
cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'positions(uint256)' 0
```

#### Step 4: Watch Price Updates (Backend Running)

The backend automatically updates prices every 30 seconds. You can monitor:

```bash
# Check current price
cast call 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 'currentPrice()'

# Mark position to update PnL
cast send --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --unlocked 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'mark(uint256)' 0

# Check credit balances
cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'credit(address)' 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'credit(address)' 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

#### Step 5: Settlement (Optional)

```bash
# Warp time forward 1 hour + 1 second
cast rpc evm_increaseTime 3601
cast rpc evm_mine

# Settle the position
cast send --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --unlocked 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'settle(uint256)' 0

# Verify position is settled
cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'positions(uint256)' 0
```

#### Step 6: Withdraw Funds

```bash
# Account 1 withdraws
cast send --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --unlocked 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'withdraw(uint256)' 0

# Account 2 withdraws
cast send --from 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --unlocked 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'withdraw(uint256)' 0
```

## 🔧 Backend Integration

### Automatic Price Updates

The backend scheduler automatically:

-   Updates H100 prices every 30 seconds
-   Uses realistic simulated price movements
-   Integrates with the H100Oracle contract
-   Provides real-time price feeds for the demo

### Manual Price Updates (if backend not running)

```bash
# Update price to $3.00 (long wins)
cast send --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --unlocked 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 'updatePrice(uint256,uint256,uint8)' 3000000000000000000 $TIMESTAMP 4

# Mark position (update PnL)
cast send --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --unlocked 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'mark(uint256)' 0
```

### Monitoring Commands

```bash
# Check open orders
cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'getOpenOrders()'

# Check position details
cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'positions(uint256)' 0

# Check credit balances
cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 'credit(address)' 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Check current price
cast call 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 'currentPrice()'
```

## 🎯 Frontend Requirements

### Key Functions to Implement

1. **Connect Wallet** - Support private key import
2. **View Open Orders** - Call `getOpenOrders()` and display
3. **Open Position** - Call `open(side, size, expiry)`
4. **Take Position** - Call `take(positionId)`
5. **View Position Details** - Call `positions(positionId)`
6. **Real-time Price Updates** - Watch oracle price
7. **PnL Display** - Calculate and show current PnL

### Events to Watch

-   `Open` - New position opened
-   `Match` - Position taken
-   `Mark` - PnL updated
-   `Settled` - Position settled
-   `Withdraw` - Funds withdrawn

### Real-time Price Monitoring

-   Watch `currentPrice()` on H100Oracle
-   Update UI when prices change
-   Calculate and display PnL changes
-   Show position status (open, filled, settled)

## 🚨 Troubleshooting

### Common Issues

1. **"FutureTimestamp" Error** - Backend handles this automatically
2. **"NonMonotonic" Error** - Backend ensures proper timestamp ordering
3. **"NotAuthorized" Error** - Use correct account for oracle updates
4. **"Insufficient Balance"** - Check USDC balance and approvals
5. **"ERC20InsufficientAllowance"** - Approve more USDC to contract
6. **Backend not starting** - Check if Anvil is running first

### Reset Demo

```bash
# Stop everything
cd smart-contracts
./scripts/stop.sh

# Restart demo
./scripts/startup.sh

# Start backend (optional)
cd backend
./start_demo_backend.sh
```

## 📝 Demo Scripts

-   `smart-contracts/scripts/startup.sh` - Complete setup
-   `backend/start_demo_backend.sh` - Start backend scheduler
-   `smart-contracts/scripts/stop.sh` - Clean shutdown
-   `smart-contracts/scripts/demo_commands.sh` - All demo commands
-   `smart-contracts/demo_info.txt` - Current demo state

## 🎯 Success Criteria

✅ **Setup**: All contracts deployed and funded  
✅ **Backend**: Price scheduler running and updating  
✅ **Trading**: Open and take positions work  
✅ **Price Updates**: Oracle updates reflect in PnL  
✅ **UI Integration**: Frontend displays real-time data  
✅ **Settlement**: Positions can be settled and withdrawn

## 🏆 Demo Checklist

-   [ ] Run `smart-contracts/scripts/startup.sh`
-   [ ] Verify all contracts deployed
-   [ ] Check USDC balances
-   [ ] Start backend with `backend/start_demo_backend.sh` (optional)
-   [ ] Verify price updates are working
-   [ ] Test position opening
-   [ ] Test position taking
-   [ ] Test PnL calculations
-   [ ] Test settlement (optional)
-   [ ] Frontend integration working
-   [ ] Real-time updates working

## 🔄 Demo Workflow

1. **Setup**: `smart-contracts/scripts/startup.sh`
2. **Backend**: `backend/start_demo_backend.sh` (optional)
3. **Frontend**: Connect wallets and start trading
4. **Demo**: Show real-time price updates and PnL changes
5. **Cleanup**: `smart-contracts/scripts/stop.sh`

**🎯 Demo is ready when all items are checked!**
