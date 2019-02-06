var CTM = artifacts.require('CirraviaTravelModel');
var ExchangeContract = artifacts.require('ExchangeMock');
let BigNumber = require('bignumber.js');

contract('CirraviaTravelModel', (accounts) => {
    
    beforeEach(async () => {
        contract = await CTM.deployed()
        exchangeContract = await ExchangeContract.deployed()
        clientAccount = accounts[1];
        ownerAccount = accounts[0];
        price = 100000;
    })

    it('Estimate gas', async() => {
        tokenId = accounts[3];
        let gas = await contract.request.estimateGas((tokenId));
        console.log("Request gas " + gas);
        await  contract.request(tokenId, {from:clientAccount, value: price});
        gas = await contract.accept.estimateGas((tokenId));
        console.log("Accept gas " + gas);
        gas = await contract.sendEther.estimateGas(accounts[4], price, 21000)
        console.log("Withdraw gas " + gas);
        gas = await contract.sendEther.estimateGas(exchangeContract.address, price, 35000)
        console.log("Withdraw contract gas " + gas);
    })

});