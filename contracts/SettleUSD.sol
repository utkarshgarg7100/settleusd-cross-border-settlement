// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title SettleUSD (SUSD) — demo payment stablecoin for a portfolio settlement simulator.
/// @notice NOT FOR PRODUCTION. Testnet artifact. No real reserves back this token.
contract SettleUSD is ERC20, ERC20Pausable, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    /// @notice Display-only reserve ratio in basis points (10000 = 100.00%). Not enforced.
    uint256 public reserveRatioBps;

    event Minted(address indexed to, uint256 amount, address indexed issuer);
    event Burned(address indexed from, uint256 amount, address indexed issuer);
    event ReserveRatioUpdated(uint256 oldBps, uint256 newBps, address indexed issuer);

    error ReserveRatioTooHigh(uint256 bps);

    constructor(address admin) ERC20("SettleUSD", "SUSD") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ISSUER_ROLE, admin);
        reserveRatioBps = 10000;
    }

    /// @dev 6 decimals to mirror USDC.
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external onlyRole(ISSUER_ROLE) {
        _mint(to, amount);
        emit Minted(to, amount, msg.sender);
    }

    /// @notice Issuer-side redemption burn (mirrors how a real issuer retires supply).
    function burn(address from, uint256 amount) external onlyRole(ISSUER_ROLE) {
        _burn(from, amount);
        emit Burned(from, amount, msg.sender);
    }

    function pause() external onlyRole(ISSUER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ISSUER_ROLE) {
        _unpause();
    }

    /// @param newBps basis points, capped at 20000 (200%) to keep the dashboard honest.
    function setReserveRatio(uint256 newBps) external onlyRole(ISSUER_ROLE) {
        if (newBps > 20000) revert ReserveRatioTooHigh(newBps);
        uint256 old = reserveRatioBps;
        reserveRatioBps = newBps;
        emit ReserveRatioUpdated(old, newBps, msg.sender);
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}
