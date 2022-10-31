//SPDX-License-Identifier:MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarketplace is ERC721URIStorage{
    using Counters for Counters.Counter;
    Counters.Counter private tokenIds;
    Counters.Counter private itemSold;

    uint256 listingPrice = 0.001 ether;
    address payable owner;

    mapping(uint=>MarketItem) private idtoMarketItem;

    struct MarketItem{
      uint256 tokenId;
      address payable seller;
      address payable owner;
      uint256 price;
      bool sold;
    }

    event MarketItemCreated (
      uint256 indexed tokenId,
      address seller,
      address owner,
      uint256 price,
      bool sold
    );

    constructor() ERC721("KLTokens","KLT"){
        owner = payable(msg.sender);
    }

    //Here the only owner can update the listing price;
    function updateListingPrice(uint _listingPrice) public payable{
        require(owner == msg.sender,"only owner can update");
        listingPrice = _listingPrice;
    }

    //Getting the listing price value;
    function getListingPrice() public view returns(uint){
        return listingPrice;
    }

    //Here user can be able to create and list the NFT;

    function CreateToken(string memory tokenURI,uint256 price) public payable returns(uint){
        tokenIds.increment();
        uint newtokenId = tokenIds.current();
        _mint(msg.sender, newtokenId);
        _setTokenURI(newtokenId, tokenURI);
        CreateMarketItem(newtokenId, price);
        return newtokenId;

    }

    //creating the Market Item to list the Nft
    function CreateMarketItem(uint tokenId, uint price) private {
        require(price>0,"price must be greather than 0");
        require(msg.value == listingPrice,"price must be equal to listing price");

        idtoMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );
        _transfer(msg.sender, address(this), tokenId);
        emit MarketItemCreated(tokenId, msg.sender, address(this), price, false); 
    }

    //Allows someone toi resell their nfts;
    function resellToken(uint tokenId,uint price) public payable{
        require(idtoMarketItem[tokenId].owner == msg.sender,"only item owner can resell" );
        require(msg.value == listingPrice,"Price must be equal to listing price");

        idtoMarketItem[tokenId].sold = false;
        idtoMarketItem[tokenId].price = price;
        idtoMarketItem[tokenId].seller = payable(msg.sender);
        idtoMarketItem[tokenId].owner = payable(address(this));
        itemSold.decrement();
        _transfer(msg.sender, address(this), tokenId);
    }

    //Creates the sale of market item;
    //transfer the ownership of token and funds between the parties;

    function CreateMarketSale(uint tokenId) public payable{
        uint price = idtoMarketItem[tokenId].price;
        address seller = idtoMarketItem[tokenId].seller;
        require(msg.value == price,"pay the asking price in order to complete the purchase");
        idtoMarketItem[tokenId].owner = payable(msg.sender);
        idtoMarketItem[tokenId].sold = true;
        idtoMarketItem[tokenId].seller = payable(address(0));
        itemSold.increment();
        _transfer(address(this), msg.sender, tokenId);
        payable(owner).transfer(listingPrice);
        payable(seller).transfer(msg.value);
    }

    //return all the unsold market items;

    function fetchMarketItems() public view returns(MarketItem[] memory){
        uint itemCount = tokenIds.current();
        uint unSoldItemCount = tokenIds.current() - itemSold.current();
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unSoldItemCount);
        for(uint i=0;i<itemCount;i++){
            if(idtoMarketItem[i+1].owner == address(this)){
                uint currentId = i+1;
                MarketItem storage currentItem = idtoMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    //Returns only items that a user has purchased
    function fetchMyNFTs() public view returns(MarketItem[] memory){
        uint totalItemCount = tokenIds.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idtoMarketItem[i + 1].owner == msg.sender) {
          itemCount += 1;
        }
      }

      MarketItem[] memory items = new MarketItem[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idtoMarketItem[i + 1].owner == msg.sender) {
          uint currentId = i + 1;
          MarketItem storage currentItem = idtoMarketItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }
    //return only the items a user has listed;
    function fetchItemsListed() public view returns (MarketItem[] memory) {
      uint totalItemCount = tokenIds.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idtoMarketItem[i + 1].seller == msg.sender) {
          itemCount += 1;
        }
      }

      MarketItem[] memory items = new MarketItem[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idtoMarketItem[i + 1].seller == msg.sender) {
          uint currentId = i + 1;
          MarketItem storage currentItem = idtoMarketItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }
}