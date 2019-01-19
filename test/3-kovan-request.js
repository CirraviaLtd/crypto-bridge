var CTM = artifacts.require('CirraviaTravelModel');
let BigNumber = require('bignumber.js');

contract('CirraviaTravelModel', (accounts) => {
    
    beforeEach(async () => {
        contract = await CTM.deployed()
        clientAccount = accounts[1];
        ownerAccount = accounts[0];
        price = 10000000000000000;
    })

    it('Request token', async() => {
        tokenId = accounts[3];
        // request
        result = await  contract.request(tokenId, {from:ownerAccount, value: price});
    
    })


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

}); 