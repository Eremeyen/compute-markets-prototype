// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal oracle interface used by ForwardEscrow
interface IH100Oracle {
	/// @return price USD-per-GPU-hour scaled by 1e18
	function latestPrice() external view returns (uint256);
}
