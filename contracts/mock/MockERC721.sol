// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract MockERC721 is ERC721("est", "EST"), Ownable {
    /// @dev Events of the contract
    event Minted(uint256 tokenId, address beneficiary, string tokenUri, address minter);

    /// @dev current max tokenId
    uint256 public tokenIdPointer;

    /// @dev TokenID -> Creator address
    mapping(uint256 => address) public creators;

    /// @notice Platform fee
    uint256 public platformFee;

    /// @notice Platform fee receipient
    address payable public feeReceipient;

    function mint(address _beneficiary, string calldata _tokenUri) external payable returns (uint256) {
        require(msg.value >= platformFee, "Insufficient funds to mint.");

        tokenIdPointer = tokenIdPointer + 1;
        uint256 tokenId = tokenIdPointer;

        // Mint token and set token URI
        _safeMint(_beneficiary, tokenId);

        // Send FTM fee to fee recipient
        feeReceipient.transfer(msg.value);

        // Associate garment designer
        creators[tokenId] = _msgSender();

        emit Minted(tokenId, _beneficiary, _tokenUri, _msgSender());

        return tokenId;
    }

    function _transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external {
        console.log("Transfer from called");
        console.log("Sender %s", msg.sender);
        console.log(from);
        console.log(to);
        console.log(tokenId);
        transferFrom(from, to, tokenId);
    }
}
