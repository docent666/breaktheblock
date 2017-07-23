var Insurance = artifacts.require("./WeatherOracleAuthorizationInsurance.sol");


var multiplier = Math.pow(10,16)

contract('WeatherOracleAuthorizationInsurance', function(accounts) {

   //truffle will by default assign accounts[0] as na owner of the deployed contract
  const account_sponsor = accounts[0];
  const account_one = accounts[1];
  const account_authorizer = accounts[2];

  const amount = multiplier*88;

  function humanReadableBalance(account) {
     return Math.floor(web3.eth.getBalance(account).toNumber()/multiplier);
  }

  it("when an insurance claim is made on a seeded pool then insured amount can be withdrawn only when the weather is cloudy", function () {
    var insurance;

    var account_one_starting_balance = humanReadableBalance(account_one);
    var insureAmount = multiplier*23;
    var poolSize = multiplier*100;
    var premium = multiplier*15;
    var claimCharge = multiplier*150;
    var amountToVerify = (insureAmount - premium)/ multiplier;
    var timestamp = web3.eth.getBlock(web3.eth.blockNumber).timestamp

    return Insurance.deployed().then(function(instance) {
        insurance = instance;
        return insurance.init.sendTransaction(poolSize, poolSize/2, timestamp, {from: account_sponsor})
    }).then(function() {
        return insurance.contribute.sendTransaction({from: account_sponsor, value: insureAmount + 10})
    }).then(function() {
        return insurance.insure.sendTransaction(insureAmount, {from:account_one, value: premium});
    }).then(function() {
        return insurance.claim.sendTransaction({from:account_one, claimCharge});
    })
    //todo: now we need to wait for callback to return, for now just check the log of the bridge
//    .then(function() {
//        return insurance.withdraw.sendTransaction({from:account_one});
//    }).then(function() {
//        var account_one_ending_balance = humanReadableBalance(account_one);
//        assert.approximately(account_one_ending_balance, account_one_starting_balance + amountToVerify, 3, "claim not recorded properly");
//    }).catch((err) => { throw new Error(err) })
//    .then(function() {
//        return insurance.contribute.sendTransaction({from: account_sponsor, value: insureAmount + 10})
//    })

  })

});
