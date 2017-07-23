var Insurance = artifacts.require("./Insurance.sol");
var ManualAuthorizationInsurance = artifacts.require("./ManualAuthorizationInsurance.sol");

module.exports = function(deployer) {
  deployer.deploy(Insurance);
  deployer.link(Insurance, ManualAuthorizationInsurance);
  deployer.deploy(ManualAuthorizationInsurance);
};
