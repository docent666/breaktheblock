pragma solidity ^0.4.2;

import './Insurance.sol';

contract ManualAuthorizationInsurance is Insurance {

    address owner;
    address authoriser;

    event RequestAuthorisation(address claimant);

    function ManualAuthorizationInsurance() {
        owner = msg.sender;
    }

    modifier owner_only() {
        require(msg.sender == owner);
        _;
    }

    function assignAuthoriser(address auth) owner_only {
        authoriser = auth;
    }

    function claim() payable {
        RequestAuthorisation(msg.sender);
    }

    function authoriseClaim(address claimant) {
        if (msg.sender == authoriser && insurances[claimant].exists) {
            insurances[claimant].withdrawable = true;
        }
    }


}