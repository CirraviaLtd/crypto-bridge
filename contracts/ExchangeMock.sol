pragma solidity ^0.5.1;

contract ExchangeMock {
    
    event TestEvent(address payable _addr1, address payable _addr2, uint _int1, uint _int2);
    event TestEvent2(address payable _addr1, address payable _addr2, uint _int1, uint _int2);

    function() external payable {
        emit TestEvent(address(0x0), msg.sender, msg.value, 0);
        address(0x0).transfer(msg.value);
        emit TestEvent2(address(0x0), msg.sender, msg.value, 0);
    }

}