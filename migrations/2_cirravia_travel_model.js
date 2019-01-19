var CTMContract = artifacts.require("./CirraviaTravelModel");
var ExchangeContract = artifacts.require("./ExchangeMock");

module.exports = function(deployer, network) {
  deployer.deploy(CTMContract);
  if (network != 'mainnet') {
    deployer.deploy(ExchangeContract);
  }
};
