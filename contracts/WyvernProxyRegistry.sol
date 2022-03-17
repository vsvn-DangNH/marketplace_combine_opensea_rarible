// SPDX-License-Identifier: MIT
/*
  << Project Wyvern Proxy Registry >>
*/

pragma solidity ^0.8.9;

import "./registry/ProxyRegistry.sol";
import "./registry/AuthenticatedProxy.sol";
/**
 * @title WyvernProxyRegistry
 * @author Project Wyvern Developers
 */
contract WyvernProxyRegistry is ProxyRegistry {
    string public constant name = "Project Wyvern Proxy Registry";

    /* Whether the initial auth address has been set. */
    bool public initialAddressSet;

    function __WyvernProxyRegistry_init(uint256 delayPeriod) initializer public {
        initialAddressSet = false;
        ProxyRegistry.__ProxyRegistry_init(delayPeriod);
        delegateProxyImplementation = new AuthenticatedProxy();
    }

    /**
     * Grant authentication to the initial Exchange protocol contract
     *
     * @dev No delay, can only be called once - after that the standard registry process with a delay must be used
     * @param authAddress Address of the contract to grant authentication
     */
    function grantInitialAuthentication(address authAddress) public onlyOwner {
        require(!initialAddressSet);
        initialAddressSet = true;
        contracts[authAddress] = true;
    }

    function test() public pure returns (uint256) {
        return 1 + 1;
    }
}
