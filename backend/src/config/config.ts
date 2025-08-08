// RPC URL for the blockchain
export const RPC_URL = 'http://localhost:8545';

// Deployed oracle contract address (set this to your deployed H100Oracle address)
export const ORACLE_ADDRESS: `0x${string}` | '' = '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512';

// Deployed MockUSDC contract address (set this to your deployed MockUSDC address)
export const USDC_ADDRESS: `0x${string}` | '' = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

// Deployed ForwardEscrow contract address (set this to your deployed ForwardEscrow address)
export const FORWARD_ESCROW_ADDRESS: `0x${string}` | '' = '0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0';

// Private key for an account that is owner or trusted updater of the oracle
export const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

// Oracle updater private key (same as PRIVATE_KEY for demo)
export const ORACLE_UPDATER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

// Cron expression (with seconds field) — every 30 seconds
export const CRON_EXPR = '*/30 * * * * *';


