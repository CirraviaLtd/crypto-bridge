var CTM = artifacts.require('CirraviaTravelModel');
var ExchangeContract = artifacts.require('ExchangeMock');
let BigNumber = require('bignumber.js');

contract('CirraviaTravelModel', (accounts) => {
    
    beforeEach(async () => {
        contract = await CTM.deployed();
        exchangeContract = await ExchangeContract.deployed();
        clientAccount = accounts[1];
        ownerAccount = accounts[0];
        price = 10000000000000000;
    })

    it('Should fail when accept/reject not requested token', async() => {
        tokenId = accounts[3];
        await catchRevert(contract.accept(tokenId), {from:ownerAccount} );
        await catchRevert(contract.reject(tokenId), {from:ownerAccount} );
        await catchRevert(contract.rejectWithRefund(tokenId), {from:ownerAccount} );
    })

    it('Request token and accept', async() => {
        tokenId = accounts[3];
        await catchRevert(contract.ownerOf(tokenId));   // should fail
        // request
        result = await  contract.request(tokenId, {from:clientAccount, value: price});
        assert.equal(result.logs.length, 1, "Wrong number of events");
        checkEvent(result.logs[0], "TokenRequested", ['_buyer', '_tokenId', '_value'], [clientAccount, tokenId, price]);
        // accept from wrong account
        await catchRevert(contract.accept(tokenId, {from:clientAccount}));
        // accept
        result = await contract.accept(tokenId, {from:ownerAccount});
        assert.equal(result.logs.length, 1, "Wrong number of events");
        checkEvent(result.logs[0], 'Accept', ['_owner', '_tokenId', '_price'], [clientAccount, tokenId, price]);
        // check owner
        scOwner = await contract.ownerOf(tokenId)
        assert.equal(scOwner, clientAccount, "Token owner didnt changed properly");

        // should fail when accept/reject again
        await catchRevert(contract.accept(tokenId), {from:ownerAccount} );
        await catchRevert(contract.reject(tokenId), {from:ownerAccount} );
        await catchRevert(contract.rejectWithRefund(tokenId), {from:ownerAccount} );
    })

    it('Request token and reject', async() => {
        tokenId = accounts[4];
        // request
        result = await  contract.request(tokenId, {from:clientAccount, value: price});
        assert.equal(result.logs.length, 1, "Wrong number of events");
        checkEvent(result.logs[0], "TokenRequested", ['_buyer', '_tokenId', '_value'], [clientAccount, tokenId, price]);
        // reject from wrong account
        await catchRevert(contract.reject(tokenId, {from:tokenId}));
        // reject
        result = await contract.reject(tokenId, {from:ownerAccount});
        assert.equal(result.logs.length, 1, "Wrong number of events");
        checkEvent(result.logs[0], 'Reject', ['_owner', '_tokenId', '_price'], [clientAccount, tokenId, price]);     
        // check owner
        await catchRevert(contract.ownerOf(tokenId))   // should fail
    })

    it('Request token and reject with refund', async() => {
        tokenId = accounts[5];
        // request
        result = await  contract.request(tokenId, {from:clientAccount, value: price});
        assert.equal(result.logs.length, 1, "Wrong number of events");
        checkEvent(result.logs[0], "TokenRequested", ['_buyer', '_tokenId', '_value'], [clientAccount, tokenId, price]);
        // reject with refund from wrong account
        await catchRevert(contract.rejectWithRefund(tokenId, {from:tokenId}));
        // reject with refund
        var clientBalance = new BigNumber(await getBalance(clientAccount));
        var contractBalance = new BigNumber(await getBalance(contract.address));        
        result = await contract.rejectWithRefund(tokenId, {from:ownerAccount});
        assert.equal(result.logs.length, 2, "Wrong number of events");
        checkEvent(result.logs[0], 'Reject', ['_owner', '_tokenId', '_price'], [clientAccount, tokenId, price]);     
        checkEvent(result.logs[1], 'Refund', ['_to', '_amount'], [clientAccount, price]);     
        var clientEndBalance = new BigNumber(await getBalance(clientAccount));
        var contractEndBalance = new BigNumber(await getBalance(contract.address));
        assert(clientBalance.plus(price).isEqualTo(clientEndBalance), "Client balance is wrong after refund");
        assert(contractBalance.minus(price).isEqualTo(contractEndBalance), "Contract balance is wrong after refund");
        // check owner
        await catchRevert(contract.ownerOf(tokenId))   // should fail
    })

    it('Manually send ether', async() => {
        var clientBalance = new BigNumber(await getBalance(clientAccount));
        var contractBalance = new BigNumber(await getBalance(contract.address));       
        // send non-owner accout 
        await catchRevert(contract.sendEther(clientAccount, web3.utils.toHex(price), {from:tokenId}));
        var clientEndBalance = new BigNumber(await getBalance(clientAccount));
        var contractEndBalance = new BigNumber(await getBalance(contract.address));
        assert(clientBalance.isEqualTo(clientEndBalance), "Client balances should be equal");
        assert(contractBalance.isEqualTo(contractEndBalance), "Contract balances should be equal");
        // send owner account
        result = await contract.sendEther(clientAccount, web3.utils.toHex(price), {from:ownerAccount});
        assert.equal(result.logs.length, 1, "Wrong number of events");
        checkEvent(result.logs[0], "EtherTransfer", ['_to', '_amount'], [clientAccount, price]);
        var clientEndBalance = new BigNumber(await getBalance(clientAccount));
        var contractEndBalance = new BigNumber(await getBalance(contract.address));
        assert(clientBalance.plus(price).isEqualTo(clientEndBalance), "Client balance is wrong after transfer");
        assert(contractBalance.minus(price).isEqualTo(contractEndBalance), "Contract balance is wrong after transfer");
    })

    it('Manually send ether to SmartContract', async() => {
        var clientBalance = new BigNumber(await getBalance(clientAccount));
        var contractBalance = new BigNumber(await getBalance(contract.address));       
        var exchangeContractBalance = new BigNumber(await getBalance(exchangeContract.address));       
        // send non-owner accout 
        await catchRevert(contract.sendEther(clientAccount, web3.utils.toHex(price), {from:tokenId}));
        var clientEndBalance = new BigNumber(await getBalance(clientAccount));
        var contractEndBalance = new BigNumber(await getBalance(contract.address));
        assert(clientBalance.isEqualTo(clientEndBalance), "Client balances should be equal");
        assert(contractBalance.isEqualTo(contractEndBalance), "Contract balances should be equal");
        // send owner account
        result = await contract.sendEther(exchangeContract.address, web3.utils.toHex(price), {from:ownerAccount});
        assert.equal(result.logs.length, 1, "Wrong number of events");
        checkEvent(result.logs[0], "EtherTransfer", ['_to', '_amount'], [clientAccount, price]);
        var clientEndBalance = new BigNumber(await getBalance(clientAccount));
        var contractEndBalance = new BigNumber(await getBalance(contract.address));
        assert(clientBalance.plus(price).isEqualTo(clientEndBalance), "Client balance is wrong after transfer");
        assert(contractBalance.minus(price).isEqualTo(contractEndBalance), "Contract balance is wrong after transfer");
    })
});


function checkEvent(event, eventName, args, values) {
    assert.equal(event.event, eventName, "Wrong Event: " + eventName);
    for (i=0; i<args.length; i++) {
        assert.equal(event.args[args[i]], values[i], "Wrong event " + eventName + " data: " + args[i]);
    }
}

async function catchRevert(promise) {
    const PREFIX = "VM Exception while processing transaction: revert";
    try {
        await promise;
        throw null;
    } catch(error) {
        assert(error, "Expected an error but did not get one");
        assert(error.message.includes(PREFIX),  PREFIX + "' but got '" + error.message + "' instead");
    }
}

async function getBalance(addr) {
    return web3.eth.getBalance(addr);
}