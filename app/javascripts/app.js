import "../stylesheets/app.css";

import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

import insurance_artifacts from '../../build/contracts/Insurance.json'

var Insurance = contract(insurance_artifacts);

var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    Insurance.setProvider(web3.currentProvider);

    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.refreshBalance();
      self.isContractFull();
      self.totalInsuranceAmount();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    var self = this;

    var ins;
    Insurance.deployed().then(function(instance) {
      ins = instance;
      return ins.balanceOf.call(account, {from: account});
    }).then(function(value) {
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  sendCoin: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var ins;
    Insurance.deployed().then(function(instance) {
      ins = instance;
      return ins.participate(receiver, amount, {from: account});
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  },

   fund: function() {
    var self = this;

    var amount = parseInt(document.getElementById("fundAmount").value);
    this.setStatus("Initiating transaction... (please wait)");

    var ins;
    Insurance.deployed().then(function(instance) {
      ins = instance;
      return ins.contribute({from: account, value: amount});
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.isContractFull();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
   },
   insure: function() {
    var self = this;

    var insuranceAmount = parseInt(document.getElementById("insuranceAmount").value);
    var premium = insuranceAmount / 10 ;
    this.setStatus("Initiating transaction... (please wait)");

    var ins;
    Insurance.deployed().then(function(instance) {
      ins = instance;
      return ins.insure(insuranceAmount, {from: account, value: premium});
    }).then(function() {
      self.setStatus("Transaction complete!");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
   },

   isContractFull: function() {
    var self = this;

    var ins;
    Insurance.deployed().then(function(instance) {
      ins = instance;
      return ins.contractFull.call({from: account});
    }).then(function(value) {
      var contractFull_element = document.getElementById("contractFull");
      contractFull_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting contract status; see log.");
    });
   },
   totalInsuranceAmount: function() {
    var self = this;

    var ins;
    Insurance.deployed().then(function(instance) {
      ins = instance;
      return ins.totalInsured.call({from: account});
    }).then(function(value) {
      var contractFull_element = document.getElementById("totalInsuranceAmount");
      contractFull_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting contract status; see log.");
    });
   }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source (e.g. MetaMask)")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
