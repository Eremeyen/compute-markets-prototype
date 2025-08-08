// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from 'lib/openzeppelin-contracts/contracts/access/Ownable.sol';
import { IH100Oracle } from './interfaces/IH100Oracle.sol';

contract H100Oracle is Ownable, IH100Oracle {
	// 1e18 = $1.00 (fixed-point with 18 decimals)
	uint256 public currentPrice;
	uint256 public lastTimestamp;
	uint256 public constant STALE_TOLERANCE = 2 hours;

	// Optional: track where the price came from
	enum PriceSource {
		Unknown,
		VastAI,
		Akash,
		Combined,
		Manual
	}
	PriceSource public lastSource;

	// Updater role(s) separate from owner
	mapping(address => bool) private trustedUpdaters;

	event PriceUpdated(uint256 price, uint256 timestamp, PriceSource source);

	error NonMonotonic();
	error FutureTimestamp();
	error NotAuthorized();
	error StaleOracle();

	constructor(address initialTrustedUpdater) Ownable(msg.sender) {
		if (initialTrustedUpdater != address(0)) {
			trustedUpdaters[initialTrustedUpdater] = true;
		}
	}

	modifier onlyUpdaterOrOwner() {
		if (msg.sender != owner() && !trustedUpdaters[msg.sender]) revert NotAuthorized();
		_;
	}

	// Owner can add/remove multiple trusted off-chain publishers
	function addTrustedUpdater(address updater) external onlyOwner {
		require(updater != address(0), 'ZERO_ADDR');
		trustedUpdaters[updater] = true;
	}

	function removeTrustedUpdater(address updater) external onlyOwner {
		trustedUpdaters[updater] = false;
	}

	function isTrustedUpdater(address account) external view returns (bool) {
		return trustedUpdaters[account];
	}

	/// @notice Off-chain publisher pushes a fresh price
	/// @param _price Price in 1e18 fixed-point USD per H100 SXM GPU-hour
	/// @param _ts Publish timestamp from the off-chain source
	/// @param _source Which source this price was derived from
	function updatePrice(
		uint256 _price,
		uint256 _ts,
		PriceSource _source
	) external onlyUpdaterOrOwner {
		// For demo: allow any timestamp if it's the first update or if it's newer
		if (lastTimestamp != 0 && _ts <= lastTimestamp) revert NonMonotonic();
		// For demo: allow timestamps up to 1 hour in the past (more lenient)
		if (block.timestamp > _ts + 3600) revert FutureTimestamp();

		currentPrice = _price;
		lastTimestamp = _ts;
		lastSource = _source;
		emit PriceUpdated(_price, _ts, _source);
	}

	/// @notice Consumers pull the latest price (reverts if stale)
	function latestPrice() public view returns (uint256) {
		if (block.timestamp - lastTimestamp > STALE_TOLERANCE) revert StaleOracle();
		return currentPrice;
	}

	/// @notice Returns latest price with metadata (reverts if stale)
	function latestPriceWithMeta()
		external
		view
		returns (uint256 price, uint256 timestamp, PriceSource source)
	{
		if (block.timestamp - lastTimestamp > STALE_TOLERANCE) revert StaleOracle();
		return (currentPrice, lastTimestamp, lastSource);
	}

	/// @notice Backwards-compatible alias
	function getH100SXMPrice() external view returns (uint256) {
		return latestPrice();
	}
}
