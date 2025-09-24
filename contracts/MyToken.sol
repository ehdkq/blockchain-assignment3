// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MyToken is ERC20, ERC20Burnable, ERC20Pausable, ERC20Capped, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    error AirdropLengthMismatch(); 

    constructor(
        string memory name,
        string memory symbol,
        uint256 cap, // Expects 18-decimal value
        address initialReceiver,
        uint256 initialMint // Expects 18-decimal value
    ) ERC20(name, symbol) ERC20Capped(cap) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _mint(initialReceiver, initialMint); 
    }

    function pause() public onlyRole(PAUSER_ROLE) { // [cite: 16]
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) { // [cite: 16]
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) { // [cite: 17]
        _mint(to, amount);
    }

    function airdrop(address[] calldata to, uint256[] calldata amounts) public onlyRole(MINTER_ROLE) { // [cite: 18]
        if (to.length != amounts.length) {
            revert AirdropLengthMismatch();// [cite: 18]
        }
        for (uint256 i = 0; i < to.length; i++) {
            _mint(to[i], amounts[i]); // The ERC20Capped contract will enforce the cap here [cite: 19]
        }
    }

    // The following functions are overrides required by Solidity.
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable, ERC20Capped) {
        super._update(from, to, value);
    }
}