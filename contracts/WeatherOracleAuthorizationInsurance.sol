pragma solidity ^0.4.2;

import './Insurance.sol';
import './usingOraclize.sol';

contract WeatherOracleAuthorizationInsurance is Insurance, usingOraclize {

    address owner;
    string expectedWeather = "Partly Cloudy";
    mapping(bytes32=>address) validIds;

    function WeatherOracleAuthorizationInsurance() {
        owner = msg.sender;
        OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
    }

    event updatedClaim(string result);
    event newOraclizeQuery(string description);


    function __callback(bytes32 myid, string result) {
        if (msg.sender != oraclize_cbAddress()) throw;
        updatedClaim(result);
        if (sha3(result) == sha3(expectedWeather)) {
            authoriseClaim(validIds[myid]);
        }
    }

    function claim() payable {
        updateClaim(msg.sender);
    }

    function authoriseClaim(address claimant) {
        if (msg.sender != oraclize_cbAddress()) throw;
        if (insurances[claimant].exists) {
            insurances[claimant].withdrawable = true;
        }
    }

    function updateClaim(address sender) payable {
        if (oraclize_getPrice("URL") > this.balance) {
            newOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
            throw;
        } else {
            newOraclizeQuery("Oraclize query was sent, standing by for the answer..");
            bytes32 queryId = oraclize_query(5, "URL", "json(https://query.yahooapis.com/v1/public/yql?q=select%20item.condition.text%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22dallas%2C%20tx%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys).query.results.channel.item.condition.text");
            validIds[queryId] = sender;
        }
    }
}