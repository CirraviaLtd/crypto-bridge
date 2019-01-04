var CTM = artifacts.require('CirraviaTravelModel');
let BigNumber = require('bignumber.js');

contract('CirraviaTravelModel', (accounts) => {
    
    beforeEach(async () => {
        contract = await CTM.deployed()
        clientAccount = accounts[1];
        ownerAccount = accounts[0];
        price = 10000000000000000;
    })

    it('Estimate gas', async() => {
        tokenId = accounts[3];
        let gas = await contract.request.estimateGas((tokenId));
        console.log("Request gas " + gas);
        await  contract.request(tokenId, {from:clientAccount, value: price});
        gas = await contract.accept.estimateGas((tokenId));
        console.log("Accept gas " + gas);
    })

});