var Insurance = artifacts.require("./Insurance.sol");

contract('Insurance', function(accounts) {

   //truffle will by default assign accounts[0] as na owner of the deployed contract
  const account_sponsor = accounts[0];
  const account_one = accounts[1];
  const account_two = accounts[2];

  const amount = Math.pow(10,16)*88;

  function humanReadableBalance(account) {
     return Math.floor(web3.eth.getBalance(account).toNumber()/Math.pow(10,16));
  }

  it("when an insurance claim is made on a seeded pool then insured amount can be withdrawn", function () {
    var insurance;

    var account_one_starting_balance = humanReadableBalance(account_one);
    var insureAmount = Math.pow(10,16)*23;
    var poolSize = Math.pow(10,16)*100;
    var premium = Math.pow(10,16)*15;
    var amountToVerify = (insureAmount - premium)/ Math.pow(10,16);

    return Insurance.deployed().then(function(instance) {
        insurance = instance;
        return insurance.init.sendTransaction(poolSize, poolSize/2, {from: account_sponsor})
    }).then(function() {
        return insurance.contribute.sendTransaction({from: account_sponsor, value: insureAmount})
    }).then(function() {
        return insurance.insure.sendTransaction(insureAmount, {from:account_one, value: premium});
    }).then(function() {
        return insurance.claim.sendTransaction({from:account_one});
//        return insurance.canClaim.sendTransaction({from:account_one});
    }).then(function() {
//        assert.equal(canClaim, true, "can claim")
        return insurance.withdraw.sendTransaction({from:account_one});
    }).then(function() {
        var account_one_ending_balance = humanReadableBalance(account_one);
        assert.approximately(account_one_ending_balance, account_one_starting_balance + amountToVerify, 3, "claim not recorded properly");
    }).catch((err) => { throw new Error(err) })
  })

  it('creation: should create an initial balance of 100 for the creator', function () {
    return Insurance.deployed().then(function(instance) {
      return instance.balanceOf.call(accounts[0])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 100)
    }).catch((err) => { throw new Error(err) })
  })

  it("can participate if pool maxed and will issue tokens", function () {
    var insurance;

    var poolSize = Math.pow(10,16)*100;
    var insureAmount = Math.pow(10,16)*23;

    return Insurance.deployed().then(function(instance) {
        insurance = instance;
        return insurance.init.sendTransaction(poolSize, poolSize/2, {from: account_sponsor})
    }).then(function() {
        return insurance.contribute.sendTransaction({from: account_sponsor, value: poolSize +1})
    }).then(function() {
        return insurance.participate.sendTransaction(account_two, 4, {from: account_sponsor})
    }).then(function() {
        return insurance.balanceOf.call(account_two)
    }).then(function(result) {
        assert.strictEqual(result.toNumber(), 4)
        return insurance.balanceOf.call(account_sponsor)
    }).then(function(result) {
        assert.strictEqual(result.toNumber(), 96)
    }).catch((err) => { throw new Error(err) })

    }
  )


   //test init function
   //add checks that the max and ratio are used
  //if not claimable do not allow to withdraw
  //if already claimed do not allow to withdraw
  //should not allow to insure if the premium is not paid


});
