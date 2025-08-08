// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/* ──────────────── external interfaces ───────────────────── */
import { IERC20 } from 'lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol';
import { IH100Oracle } from './interfaces/IH100Oracle.sol';

/* ─────────────────────────────────────────────────────────── */

contract ForwardEscrow {
	/* ───────── custom errors ───────── */
	error SizeIsZero();
	error AlreadySettled();
	error NotSettled();
	error OrderAlreadyFilled();
	error Unfilled();
	error NotExpired();
	error ZeroBalance();
	/* ───────── immutable config ───────── */
	IH100Oracle public immutable oracle; // on-chain median price feed
	IERC20 public immutable usdc; // 6-decimals stable coin
	uint256 public constant HAIRCUT_BPS = 3000; // 30 % initial margin

	/* ───────── user credit balances ───── */
	mapping(address => uint256) public credit; // withdrawable USDC (6-dec)

	/* ───────── order / position state ─── */
	enum Side {
		Long,
		Short
	}

	struct Position {
		address long;
		address short;
		uint256 size; // GPU-hours
		uint256 entryPrice; // 1e18 USD
		uint256 lastPrice; // last mark price
		uint256 expiry; // unix timestamp
		bool settled;
	}

	Position[] public positions; // index = positionId

	/* open-order bulletin board (id list) */
	uint256[] public openOrderIds;
	mapping(uint256 => uint256) private openIdx; // posId → index in openOrderIds

	/* ───────── events ─────────────────── */
	event Open(
		uint256 indexed id,
		Side side,
		address indexed maker,
		uint256 size,
		uint256 price,
		uint256 expiry
	);
	event Match(uint256 indexed id, address indexed taker, Side side);
	event Mark(uint256 indexed id, uint256 price, int256 pnlUsd18);
	event Settled(uint256 indexed id, uint256 finalPrice);
	event Withdraw(address indexed trader, uint256 usdcAmt);

	/* ───────── constructor ────────────── */
	constructor(address _oracle, address _usdc) {
		oracle = IH100Oracle(_oracle);
		usdc = IERC20(_usdc);
	}

	/* =======================================================
                1.  open order  (long **or** short)
       =======================================================*/
	function open(Side side, uint256 gpuHours, uint256 expirySecs) external returns (uint256 id) {
		if (gpuHours == 0) revert SizeIsZero();

		uint256 px = oracle.latestPrice(); // 1e18 USD
		// Calculate margin: (gpuHours * px * HAIRCUT_BPS) / (10000 * 1e12)
		uint256 marginUSDC = (gpuHours * px * HAIRCUT_BPS) / (10_000 * 1e12); // 6 decimals

		require(usdc.transferFrom(msg.sender, address(this), marginUSDC), 'TRANSFER_FROM_FAIL');
		credit[msg.sender] += marginUSDC; // escrow recorded

		Position memory p;
		if (side == Side.Long) p.long = msg.sender;
		else p.short = msg.sender;

		p.size = gpuHours;
		p.entryPrice = px;
		p.lastPrice = px;
		p.expiry = block.timestamp + expirySecs;

		positions.push(p);
		id = positions.length - 1;

		/* push to open-orders list */
		openIdx[id] = openOrderIds.length;
		openOrderIds.push(id);

		emit Open(id, side, msg.sender, gpuHours, px, p.expiry);
	}

	/* =======================================================
                2.  match order (take opposite side)
       =======================================================*/
	function take(uint256 id) external {
		Position storage p = positions[id];
		if (p.settled) revert AlreadySettled();
		Side takerSide;
		if (p.long == address(0)) {
			if (p.short == address(0)) {
				revert OrderAlreadyFilled();
			}
			p.long = msg.sender;
			takerSide = Side.Long;
		} else {
			if (p.short != address(0)) {
				revert OrderAlreadyFilled();
			}
			p.short = msg.sender;
			takerSide = Side.Short;
		}

		uint256 px = oracle.latestPrice(); // 1e18 USD
		uint256 marginUSDC = (p.size * px * HAIRCUT_BPS) / (10_000 * 1e12); // 6 decimals
		require(usdc.transferFrom(msg.sender, address(this), marginUSDC), 'TRANSFER_FROM_FAIL');
		credit[msg.sender] += marginUSDC;

		p.entryPrice = px;
		p.lastPrice = px;

		/* remove from open list (swap-pop) */
		uint256 idx = openIdx[id];
		uint256 last = openOrderIds[openOrderIds.length - 1];
		openOrderIds[idx] = last;
		openIdx[last] = idx;
		openOrderIds.pop();
		delete openIdx[id];

		emit Match(id, msg.sender, takerSide);
	}

	/* =======================================================
                3.  variation-margin mark (cron or anyone)
       =======================================================*/
	function mark(uint256 id) public {
		Position storage p = positions[id];
		if (p.settled) revert AlreadySettled();
		if (p.long == address(0) || p.short == address(0)) revert Unfilled();

		uint256 px = oracle.latestPrice();
		if (px == p.lastPrice) return;

		// Simple PnL calculation: (current_price - last_price) * size / 1e18
		// Then convert to USDC: multiply by 1e6 and divide by 1e12
		uint256 priceDiff;
		bool isPositive;

		if (px > p.lastPrice) {
			priceDiff = px - p.lastPrice;
			isPositive = true;
		} else {
			priceDiff = p.lastPrice - px;
			isPositive = false;
		}

		// Calculate PnL in USD (1e18): (priceDiff * size) / 1e18
		uint256 pnlUsd18 = (priceDiff * p.size) / 1e18;

		// Convert to USDC (1e6): (pnlUsd18 * 1e6) / 1e12
		uint256 usdcAmt = (pnlUsd18 * 1e6) / 1e12;

		if (usdcAmt > 0) {
			if (isPositive) {
				// Long wins, short loses
				credit[p.long] += usdcAmt;
				if (credit[p.short] >= usdcAmt) {
					credit[p.short] -= usdcAmt;
				} else {
					credit[p.short] = 0;
				}
			} else {
				// Short wins, long loses
				credit[p.short] += usdcAmt;
				if (credit[p.long] >= usdcAmt) {
					credit[p.long] -= usdcAmt;
				} else {
					credit[p.long] = 0;
				}
			}
		}

		p.lastPrice = px;

		// Emit with signed PnL
		int256 signedPnl = isPositive ? int256(pnlUsd18) : -int256(pnlUsd18);
		emit Mark(id, px, signedPnl);
	}

	/* =======================================================
                4.  final settlement (after expiry)
       =======================================================*/
	function settle(uint256 id) public {
		Position storage p = positions[id];
		if (block.timestamp < p.expiry) revert NotExpired();
		if (p.settled) revert AlreadySettled();

		mark(id); // apply last P/L move
		p.settled = true;

		emit Settled(id, p.lastPrice);
	}

	/* =======================================================
                5.  withdraw (after settlement)
       =======================================================*/
	function withdraw(uint256 id) external {
		Position storage p = positions[id];
		if (!p.settled) revert NotSettled();

		uint256 bal = credit[msg.sender];
		if (bal == 0) revert ZeroBalance();
		credit[msg.sender] = 0;
		require(usdc.transfer(msg.sender, bal), 'TRANSFER_FAIL');

		emit Withdraw(msg.sender, bal);
	}

	/* =======================================================
                6.  order-book helper views
       =======================================================*/
	/// @notice Returns the list of position ids that are not fully matched yet.
	/// UI can watch this plus `positions(id)` (auto-generated public getter)
	/// to determine which side is missing (long or short) and display matchable orders.
	function getOpenOrders() external view returns (uint256[] memory ids) {
		return openOrderIds;
	}
}
