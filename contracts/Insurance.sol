pragma solidity ^0.4.2;

import 'zeppelin-solidity/contracts/token/StandardToken.sol';

contract Insurance is StandardToken {

	string public constant name = "ClaiMeToken";
	string public constant symbol = "CMT";
	uint256 public constant decimals = 18;
	uint256 public constant INITIAL_SUPPLY = 100;

	uint MAXIMUM_POOL_SIZE = 0;
    uint RETENTION = 0;
    bool contractFull = false;

	struct Insured {
		bool withdrawable;
		bool claimed;
		uint claimSize;
		bool exists;
		uint premium;
        uint policyStartTime;
        uint policyEndTime;
	}

	address owner;
	mapping(address => Insured) insurances;
	mapping(address => uint) contributors;
	uint insurancesCount = 0;
	uint insurancesClaimed = 0;
	uint insurancesLapsed = 0;
	uint poolSize = 0;
    uint premiums = 0;
	//token retention ratio - 20% to remain with the owner (insurance company)


	function Insurance() {
		owner = msg.sender;
		totalSupply = INITIAL_SUPPLY;
		balances[msg.sender] = INITIAL_SUPPLY;
	}

	function init(uint maxPoolSize, uint retentionRatio) owner_only {
		MAXIMUM_POOL_SIZE = maxPoolSize;
		RETENTION = retentionRatio;
	}

	//fallback function
	function() {
		//if ether is sent to this address, send it back.
		throw;
	}

	modifier owner_only() {
		require(msg.sender == owner);
		_;
	}

	function contribute() payable owner_only {
        require(!contractFull);
		poolSize = poolSize + msg.value;
		contributors[msg.sender] = contributors[msg.sender] + msg.value;
        if (poolSize >= MAXIMUM_POOL_SIZE) {
			contractFull = true;
			//contract is filled, so we can now release participation tokens
			StandardToken.approve(owner, INITIAL_SUPPLY);
		}
	}

	function participate(address to, uint tokens) payable owner_only {
        require(contractFull);
		StandardToken.transferFrom(msg.sender, to, tokens);
	}

	function insure(uint claimSize) payable {
		var insured = Insured(false, false, claimSize, true, msg.value, now, now);
		insurances[msg.sender] = insured;
        premiums = premiums + msg.value;
	}

	function claim() {
		if (insurances[msg.sender].exists) {
			insurances[msg.sender].withdrawable = true;
		}
	}

	function withdraw() payable {
		if (insurances[msg.sender].withdrawable) {
			msg.sender.transfer(insurances[msg.sender].claimSize);
			insurances[msg.sender].claimed = true;
		}
    }

    //todo: only allow when all insurances are claimed or lapsed
	//todo: bug around standard token transfer
    function withdrawAsParticipant() payable {
        require(balances[msg.sender] > 0);
        var toTransfer = contributors[owner] * balances[msg.sender] / INITIAL_SUPPLY;
        msg.sender.transfer(toTransfer);
        contributors[owner] = contributors[owner] - toTransfer;
		//todo: no idea why we cannot move full balance, but hey, tired of invalid opcode  ¯\_(ツ)_/¯
		StandardToken.approve(msg.sender, balanceOf(msg.sender) - 1);
		//forfeit the tokens to prevent further withdrawals
		StandardToken.transferFrom(msg.sender, this, balanceOf(msg.sender) -1);
    }
}
