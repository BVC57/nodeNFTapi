//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address public deploymentAddress;

    // WRITE ASSET NAME AND LOGO
    constructor() ERC721("SakshamAssets", "SKSHM") {
        deploymentAddress = address(this); // Record the deployment address
    }

    function mintNFT(address recipient, string memory tokenURI)
        public onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function getData(uint256  tokenIds) public view returns (string memory) {
        require(_exists(tokenIds), "Token ID does not exist");
        return tokenURI(tokenIds);
    }

    function getDeploymentAddress() public view returns (address) {
        return deploymentAddress;
    }
}
