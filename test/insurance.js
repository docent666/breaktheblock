var Insurance = artifacts.require("./Insurance.sol");


var multiplier = Math.pow(10,16)

contract('Insurance', function(accounts) {

   //truffle will by default assign accounts[0] as na owner of the deployed contract
  const account_sponsor = accounts[0];
  const account_one = accounts[1];
  const account_two = accounts[2];

  const amount = multiplier*88;

  function humanReadableBalance(account) {
     return Math.floor(web3.eth.getBalance(account).toNumber()/multiplier);
  }

  it("when an insurance claim is made on a seeded pool then insured amount can be withdrawn", function () {
    var insurance;

    var account_one_starting_balance = humanReadableBalance(account_one);
    var insureAmount = multiplier*23;
    var poolSize = multiplier*100;
    var premium = multiplier*15;
    var amountToVerify = (insureAmount - premium)/ multiplier;

    return Insurance.deployed().then(function(instance) {
        insurance = instance;
        return insurance.init.sendTransaction(poolSize, poolSize/2, {from: account_sponsor})
    }).then(function() {
        return insurance.contribute.sendTransaction({from: account_sponsor, value: insureAmount + 10})
    }).then(function() {
        return insurance.insure.sendTransaction(insureAmount, {from:account_one, value: premium});
    }).then(function() {
        return insurance.claim.sendTransaction({from:account_one});
    }).then(function() {
        return insurance.withdraw.sendTransaction({from:account_one});
    }).then(function() {
        var account_one_ending_balance = humanReadableBalance(account_one);
        assert.approximately(account_one_ending_balance, account_one_starting_balance + amountToVerify, 3, "claim not recorded properly");
    }).catch((err) => { throw new Error(err) })
  })

    it("when an insurance claim is not made then insured amount can not be withdrawn", function () {
      var insurance;

      var account_one_starting_balance = humanReadableBalance(account_one);
      var insureAmount = multiplier*23;
      var poolSize = multiplier*100;
      var premium = multiplier*15;
      var amountToVerify = premium/ multiplier;

      return Insurance.deployed().then(function(instance) {
          insurance = instance;
          return insurance.init.sendTransaction(poolSize, poolSize/2, {from: account_sponsor})
      }).then(function() {
          return insurance.contribute.sendTransaction({from: account_sponsor, value: insureAmount + 10})
      }).then(function() {
          return insurance.insure.sendTransaction(insureAmount, {from:account_one, value: premium});
      }).then(function() {
          return insurance.withdraw.sendTransaction({from:account_one});
      }).then(function() {
          var account_one_ending_balance = humanReadableBalance(account_one);
          assert.approximately(account_one_ending_balance, account_one_starting_balance - amountToVerify, 3, "only premium should be deducted");
      }).catch((err) => { throw new Error(err) })
    })

    //according to documentation, throw will refund the caller with ether supplied minus the gas used
    //in this case however the gas used appears to be more than the provided premium in other tests
    //so for the purpose of this test we increase premium and other amounts to make the demonstration clearer
    it("when an insurance request is raised when pool is insufficient, request is denied", function () {
      var insurance;

      var account_one_starting_balance = humanReadableBalance(account_one);
      var insureAmount = multiplier*230;
      var poolSize = multiplier*1000;
      var premium = multiplier*150;
      var gasUsageEstimate = multiplier*45; //heuristic, as insurance.insure.estimateGas() returns NaN
      var amountToVerify = gasUsageEstimate/ multiplier;

      return Insurance.new().then(function(instance) {
          insurance = instance;
          return insurance.init.sendTransaction(poolSize, poolSize/2, {from: account_sponsor})
      }).then(function() {
          return insurance.contribute.sendTransaction({from: account_sponsor, value: 0})
      }).then(function() {
          return insurance.insure.sendTransaction(insureAmount, {from:account_one, value: premium});
      }).then(assert.fail)
        .catch(function(error) {}).then(function() {
          var account_one_ending_balance = humanReadableBalance(account_one);
          assert.approximately(account_one_ending_balance, account_one_starting_balance - amountToVerify, 3, "account not affected");
      })
    })

  it('creation: should create an initial balance of 100 for the creator', function () {
    return Insurance.deployed().then(function(instance) {
      return instance.balanceOf.call(accounts[0])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 100)
    }).catch((err) => { throw new Error(err) })
  })

  it("can participate if pool maxed and will issue tokens which allow withdrawal", function () {
    var insurance;

    var poolSize = multiplier*100;
    var insureAmount = multiplier*23;
    var expectedWithdrawal = poolSize * 0.24 / multiplier
    var account_two_starting_balance = humanReadableBalance(account_two);
    var account_two_ending_balance = 0;

    return Insurance.new().then(function(instance) {
        insurance = instance;
        return insurance.init.sendTransaction(poolSize, poolSize/2, {from: account_sponsor})
    }).then(function() {
        return insurance.contribute.sendTransaction({from: account_sponsor, value: poolSize +1})
    }).then(function() {
        return insurance.participate.sendTransaction(account_two, 24, {from: account_sponsor})
    }).then(function() {
        return insurance.balanceOf.call(account_two)
    }).then(function(result) {
        assert.strictEqual(result.toNumber(), 24)
        return insurance.balanceOf.call(account_sponsor)
    }).then(function(result) {
        assert.strictEqual(result.toNumber(), 76)
    }).then(function() {
        return insurance.withdrawAsParticipant.sendTransaction({from: account_two})
    }).then(function(result) {
        account_two_ending_balance = humanReadableBalance(account_two);
        assert.approximately(account_two_ending_balance, account_two_starting_balance + expectedWithdrawal, 2, "not withdrawn expected amount");
    }).then(function() {
        return insurance.withdrawAsParticipant.sendTransaction({from: account_two})
    }).then(function(result) {
        var account_two_new_ending_balance = humanReadableBalance(account_two);
        assert.approximately(account_two_ending_balance, account_two_new_ending_balance, 2, "should not allow to withdraw twice");
        return insurance.balanceOf.call(account_two)
    }).then(function(result) {
        //todo: that's a bug
        assert.strictEqual(result.toNumber(), 1)
        return insurance.balanceOf.call(account_sponsor)
    }).then(function(result) {
        assert.strictEqual(result.toNumber(), 76)
    })


    }
  )

    it("if no other participants, owner is sole participants and can withdraw", function () {
      var insurance;

      var poolSize = multiplier*1000;
      var gasConsumption = multiplier*10;
      var expectedWithdrawal = (gasConsumption)/ multiplier
      var account_sponsor_starting_balance = humanReadableBalance(account_sponsor);

      return Insurance.new().then(function(instance) {
          insurance = instance;
          return insurance.init.sendTransaction(poolSize, poolSize/2, {from: account_sponsor})
      }).then(function() {
          return insurance.contribute.sendTransaction({from: account_sponsor, value: poolSize +1})
      }).then(function() {
          return insurance.withdrawAsOwner.sendTransaction({from: account_sponsor})
      }).then(function(result) {
          var account_sponsor_ending_balance = humanReadableBalance(account_sponsor);
          assert.approximately(account_sponsor_ending_balance, account_sponsor_starting_balance - expectedWithdrawal, 2, "not withdrawn expected amount");
      })
      }
    )

//  it("should not allow further withdrawals if already withdrawn", function () {
//   var insurance;
//   var account_two_starting_balance = humanReadableBalance(account_two);
//
//   return Insurance.deployed().then(function(instance) {
//          insurance = instance;
//          return insurance.withdrawAsParticipant.sendTransaction({from: account_two})
//   }).then(function(result) {
//          var account_two_ending_balance = humanReadableBalance(account_two);
//          assert.approximately(account_two_ending_balance, account_two_starting_balance, 2, "should be the same balance");
//    })
//  })

   //test init function
   //add checks that the max and ratio are used
  //if not claimable do not allow to withdraw
  //if already claimed do not allow to withdraw
  //should not allow to insure if the premium is not paid
  //test that premiums are included in withdrawal


});
