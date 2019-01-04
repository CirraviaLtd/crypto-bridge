pragma solidity ^0.5.1;

contract Ownable {
    
    address private _owner;

    /**
    * @dev The Ownable constructor sets the original `owner` of the contract to the sender
    * account.
    */
    constructor() public {
        _owner = msg.sender;
    }

    function owner() public view returns(address) {
        return _owner;
    }

    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier onlyOwner() {
        require(isOwner(), "Only contract owner can call this method");
        _;
    }

    /**
    * @return true if `msg.sender` is the owner of the contract.
    */
    function isOwner() public view returns(bool) {
        return msg.sender == _owner;
    }

}
