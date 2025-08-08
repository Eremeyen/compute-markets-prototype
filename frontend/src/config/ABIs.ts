export const ForwardEscrowABI = [
    {
        "type": "constructor",
        "inputs": [
            { "name": "_oracle", "type": "address", "internalType": "address" },
            { "name": "_usdc", "type": "address", "internalType": "address" }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "HAIRCUT_BPS",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "credit",
        "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getOpenOrders",
        "inputs": [],
        "outputs": [{ "name": "ids", "type": "uint256[]", "internalType": "uint256[]" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "mark",
        "inputs": [{ "name": "id", "type": "uint256", "internalType": "uint256" }],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "open",
        "inputs": [
            { "name": "side", "type": "uint8", "internalType": "enum ForwardEscrow.Side" },
            { "name": "gpuHours", "type": "uint256", "internalType": "uint256" },
            { "name": "expirySecs", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [{ "name": "id", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "openOrderIds",
        "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "oracle",
        "inputs": [],
        "outputs": [{ "name": "", "type": "address", "internalType": "contract IH100Oracle" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "positions",
        "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "outputs": [
            { "name": "long", "type": "address", "internalType": "address" },
            { "name": "short", "type": "address", "internalType": "address" },
            { "name": "size", "type": "uint256", "internalType": "uint256" },
            { "name": "entryPrice", "type": "uint256", "internalType": "uint256" },
            { "name": "lastPrice", "type": "uint256", "internalType": "uint256" },
            { "name": "expiry", "type": "uint256", "internalType": "uint256" },
            { "name": "settled", "type": "bool", "internalType": "bool" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "settle",
        "inputs": [{ "name": "id", "type": "uint256", "internalType": "uint256" }],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "take",
        "inputs": [{ "name": "id", "type": "uint256", "internalType": "uint256" }],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "usdc",
        "inputs": [],
        "outputs": [{ "name": "", "type": "address", "internalType": "contract IERC20" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "withdraw",
        "inputs": [{ "name": "id", "type": "uint256", "internalType": "uint256" }],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "Mark",
        "inputs": [
            { "name": "id", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "price", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "pnlUsd18", "type": "int256", "indexed": false, "internalType": "int256" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Match",
        "inputs": [
            { "name": "id", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "taker", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "side", "type": "uint8", "indexed": false, "internalType": "enum ForwardEscrow.Side" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Open",
        "inputs": [
            { "name": "id", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "side", "type": "uint8", "indexed": false, "internalType": "enum ForwardEscrow.Side" },
            { "name": "maker", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "size", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "price", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "expiry", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Settled",
        "inputs": [
            { "name": "id", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "finalPrice", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Withdraw",
        "inputs": [
            { "name": "trader", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "usdcAmt", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
    },
    { "type": "error", "name": "AlreadySettled", "inputs": [] },
    { "type": "error", "name": "NotExpired", "inputs": [] },
    { "type": "error", "name": "NotSettled", "inputs": [] },
    { "type": "error", "name": "OrderAlreadyFilled", "inputs": [] },
    { "type": "error", "name": "SizeIsZero", "inputs": [] },
    { "type": "error", "name": "Unfilled", "inputs": [] },
    { "type": "error", "name": "ZeroBalance", "inputs": [] }
] as const;

export const H100OracleABI = [
    {
        "type": "constructor",
        "inputs": [{ "name": "initialTrustedUpdater", "type": "address", "internalType": "address" }],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "STALE_TOLERANCE",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "addTrustedUpdater",
        "inputs": [{ "name": "updater", "type": "address", "internalType": "address" }],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "currentPrice",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getH100SXMPrice",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "isTrustedUpdater",
        "inputs": [{ "name": "account", "type": "address", "internalType": "address" }],
        "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "lastSource",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint8", "internalType": "enum H100Oracle.PriceSource" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "lastTimestamp",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "latestPrice",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "latestPriceWithMeta",
        "inputs": [],
        "outputs": [
            { "name": "price", "type": "uint256", "internalType": "uint256" },
            { "name": "timestamp", "type": "uint256", "internalType": "uint256" },
            { "name": "source", "type": "uint8", "internalType": "enum H100Oracle.PriceSource" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "removeTrustedUpdater",
        "inputs": [{ "name": "updater", "type": "address", "internalType": "address" }],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "renounceOwnership",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [{ "name": "newOwner", "type": "address", "internalType": "address" }],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "updatePrice",
        "inputs": [
            { "name": "_price", "type": "uint256", "internalType": "uint256" },
            { "name": "_ts", "type": "uint256", "internalType": "uint256" },
            { "name": "_source", "type": "uint8", "internalType": "enum H100Oracle.PriceSource" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "OwnershipTransferred",
        "inputs": [
            { "name": "previousOwner", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "newOwner", "type": "address", "indexed": true, "internalType": "address" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "PriceUpdated",
        "inputs": [
            { "name": "price", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "source", "type": "uint8", "indexed": false, "internalType": "enum H100Oracle.PriceSource" }
        ],
        "anonymous": false
    },
    { "type": "error", "name": "FutureTimestamp", "inputs": [] },
    { "type": "error", "name": "NonMonotonic", "inputs": [] },
    { "type": "error", "name": "NotAuthorized", "inputs": [] },
    { "type": "error", "name": "OwnableInvalidOwner", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }] },
    { "type": "error", "name": "OwnableUnauthorizedAccount", "inputs": [{ "name": "account", "type": "address", "internalType": "address" }] },
    { "type": "error", "name": "StaleOracle", "inputs": [] }
] as const;

export const IH100OracleABI = [
    {
        "type": "function",
        "name": "latestPrice",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    }
] as const;