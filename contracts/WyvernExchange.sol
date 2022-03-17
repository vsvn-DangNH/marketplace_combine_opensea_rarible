// SPDX-License-Identifier: MIT
/*

  << Project Wyvern Exchange >>

*/

pragma solidity ^0.8.9;

import "./exchange/Exchange.sol";
/**
 * @title WyvernExchange
 * @author Project Wyvern Developers
 */
contract WyvernExchange is Exchange{
    string public name;

    string public version;

    string public codename;

    // /**
    //  * @dev Initialize a WyvernExchange instance
    //  * @param registryAddress Address of the registry instance which this Exchange instance will use
    //  * @param tokenAddress Address of the token used for protocol fees
    //  */

    function __WyvernExchange_init(
        ProxyRegistry registryAddress,
        TokenTransferProxy tokenTransferProxyAddress,
        ERC20  tokenAddress,
        address protocolFeeAddress
    ) initializer public  {
        Exchange.__Exchange_init();
        registry = registryAddress;
        tokenTransferProxy = tokenTransferProxyAddress;
        exchangeToken = tokenAddress;
        protocolFeeRecipient = payable(protocolFeeAddress);
        name = "Project Wyvern Exchange";
        version = "2.2";
        codename = "Bling Blong";
    }
}
