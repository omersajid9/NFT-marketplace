//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard
{
    address payable public immutable feeAccount;
    uint public immutable feePercent;
    uint public itemCount;

    struct Item
    {
        uint itemId;
        IERC721 nft;
        uint price;
        uint tokenId;
        address payable seller;
        bool sold;
    }

    mapping(uint => Item) public items;

    event ItemCreated(uint itemId, address indexed nft, uint price, uint tokenId, address indexed seller);
    event ItemTransfered(uint itemId, address indexed nft, uint tokenId, uint price, address indexed seller, address indexed buyer);

    constructor(uint _feePercent)
    {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    function createItem(IERC721 _nft, uint _tokenID, uint _price) external nonReentrant
    {
        require(_price > 0, "You selling for free?");
        require(_tokenID > 0, "Invalid token id");
        
        itemCount++;

        _nft.transferFrom(msg.sender, address(this), _tokenID);

        items[itemCount] = Item(itemCount, _nft, _price, _tokenID, payable(msg.sender), false);

        emit ItemCreated(itemCount, address(_nft), _price, _tokenID, address(msg.sender));
    }

    function purchaseItem(uint _itemID) external payable nonReentrant
    {
        require(_itemID > 0 && _itemID <= itemCount, "Invalid token id");
        uint _totalPrice = getTotalPrice(_itemID);
        Item storage transfer = items[_itemID];
        require(msg.value >= _totalPrice, "not enough ether");
        require(!transfer.sold, "Item already sold");
        require(address(transfer.seller) != address(msg.sender), "Cannot puchase own item");

        transfer.seller.transfer(transfer.price);
        feeAccount.transfer(_totalPrice - transfer.price);

        transfer.sold = true;

        transfer.nft.transferFrom(address(this), msg.sender, transfer.tokenId);
        
        emit ItemTransfered(_itemID, address(transfer.nft), transfer.tokenId, _totalPrice, transfer.seller, msg.sender);
    }

    function getTotalPrice(uint _itemID) view public returns (uint)
    {
        uint price = items[_itemID].price;
        return price * (100 + feePercent) /100;

    }


}