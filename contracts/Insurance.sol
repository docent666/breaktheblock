pragma solidity ^0.4.2;

contract Insurance {

	struct Insured {
		bool withdrawable;
		bool claimed;
		uint claimSize;
		bool exists;
		uint premium;
	}

	mapping(address => Insured) insurances;

	uint poolSize = 0;

//token retention ratio - 20% to remain with the owner (insurance company)

	mapping(address => uint) contributors;

	function() {

	}

	//for owner/participant only
	function contribute() payable {
		poolSize = poolSize + msg.value;
		if (contributors[msg.sender]!= 0){
			contributors[msg.sender] = contributors[msg.sender] + msg.value;
		} else {
			contributors[msg.sender] = msg.value;
		}
	}

//for participant only
//	function participate() payable {
//
//	}

	function insure(uint claimSize) payable {
		var insured = Insured(false, false, claimSize, true, msg.value);
		insurances[msg.sender] = insured;
	}

	function claim() {
		if (insurances[msg.sender].exists) {
			insurances[msg.sender].withdrawable = true;
		}
	}

//	function canClaim() constant returns (bool claimable) {
//		return insurances[msg.sender].claimable;
//	}

	function withdraw() payable {
		if (insurances[msg.sender].withdrawable) {
			msg.sender.transfer(insurances[msg.sender].claimSize);
			insurances[msg.sender].claimed = true;
		}
//		} else {
//			throw;
//		}
		//if msg address in insurances
		//if claimable
		//allow withdrawal of claim

		//if participation token owner
		//if all claims processed
		//allow withdrawal of relevant fraction of the pool

	}

	function blah() constant returns (bool something) {
		return true;
	}

}
