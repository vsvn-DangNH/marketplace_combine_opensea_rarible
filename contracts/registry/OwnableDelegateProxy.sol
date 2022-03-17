// SPDX-License-Identifier: MIT
/*
  WyvernOwnableDelegateProxy
*/

pragma solidity ^0.8.9;

import "./ProxyRegistry.sol";
import "./AuthenticatedProxy.sol";
import "./proxy/OwnedUpgradeabilityProxy.sol";

contract OwnableDelegateProxy is OwnedUpgradeabilityProxy {
    constructor(
        address owner,
        address initialImplementation,
        bytes memory _calldata
    ) public {
        setUpgradeabilityOwner(owner);
        _upgradeTo(initialImplementation);
        (bool result, ) = initialImplementation.delegatecall(_calldata);
        require(result, "OwnableDelegateProxy failed implementation");
    }
}
