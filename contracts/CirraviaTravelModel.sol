pragma solidity ^0.5.1;

import "./Ownable.sol";

contract CirraviaTravelModel is Ownable {

    // EVENTS
    event TokenRequested(address payable _buyer, address _tokenId, uint _value);
    event Accept(address payable _owner, address _tokenId, uint _price);
    event Reject(address payable _owner, address _tokenId, uint _price);
    event Refund(address payable _to, uint _amount);
    event EtherTransfer(address payable _to, uint _amount);

    // maps requested token id to address which requested that token
    mapping(address => address payable) private requestedTokens;
    // maps requested token id to price offered for this token
    mapping(address => uint) private requestedTokensPrice;
    // maps token id to it's owner
    mapping (address => address payable) private tokenOwner;
    // maps owner to list of owned token IDs
    mapping (address => address[]) private ownedTokens;
    // balance of rejected orders for given address
    mapping (address => uint256) private rejectedBalance;


    function request(address _tokenId) public payable {
        require(requestedTokens[_tokenId] == address(0), "Token already requested"); // must not be already requested
        requestedTokens[_tokenId] = msg.sender;
        requestedTokensPrice[_tokenId] = msg.value;
        emit TokenRequested(msg.sender, _tokenId, msg.value);
    }

    function accept(address _tokenId) public onlyOwner {
        require(requestedTokens[_tokenId] != address(0), "Requested token not found. Perhaps token is already accepted/rejected");
        tokenOwner[_tokenId] = requestedTokens[_tokenId];
        ownedTokens[requestedTokens[_tokenId]].push(_tokenId);
        uint price = requestedTokensPrice[_tokenId];
        delete requestedTokens[_tokenId];
        delete requestedTokensPrice[_tokenId];
        emit Accept(tokenOwner[_tokenId], _tokenId, price);
    }

    // no need for withdraw pattern?
    function rejectWithRefund(address _tokenId) public onlyOwner {
        require(requestedTokens[_tokenId] != address(0), "Requested token not found. Perhaps token is already accepted/rejected");
        uint price = requestedTokensPrice[_tokenId];
        address payable refund = requestedTokens[_tokenId];
        delete requestedTokens[_tokenId];
        delete requestedTokensPrice[_tokenId];
        emit Reject(refund, _tokenId, price);
        refund.transfer(price);
        emit Refund(refund, price);
    }

    function reject(address _tokenId) public onlyOwner {
        require(requestedTokens[_tokenId] != address(0), "Requested token not found. Perhaps token is already accepted/rejected");
        uint price = requestedTokensPrice[_tokenId];
        address payable buyer = requestedTokens[_tokenId];
        delete requestedTokens[_tokenId];
        delete requestedTokensPrice[_tokenId];
        emit Reject(buyer, _tokenId, price);
        rejectedBalance[buyer] += price;
    }

    // manually send ether
    function sendEther(address payable _receiver, uint _value) public onlyOwner {
        _receiver.transfer(_value);
        emit EtherTransfer(_receiver, _value);
    }

    /**
    * eip721-like functions
    */
    function ownerOf(address _tokenId) public view returns (address) {
        address owner = tokenOwner[_tokenId];
        require(owner != address(0));
        return owner;
    }

}
