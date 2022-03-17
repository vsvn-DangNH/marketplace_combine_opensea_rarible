// SPDX-License-Identifier: MIT
/*

  << Project Wyvern Token Transfer Proxy >.

*/

pragma solidity ^0.8.9;

import "./registry/TokenTransferProxy.sol";

contract WyvernTokenTransferProxy is TokenTransferProxy {
    constructor(ProxyRegistry registryAddr) {
        registry = registryAddr;
    }
}
