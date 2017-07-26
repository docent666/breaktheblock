#  \#BreakTheBlock London Insurance Hackathon Entry for team RE-X
# RUNNER UP PRIZE: Most Sophisticated Insurance Product

#  Team
Mark Painter
Lukasz Musial
Joseph Christopherson
Hugh Karp

# setup
install zeppelin as per https://github.com/OpenZeppelin/zeppelin-solidity
`npm install zeppelin-solidity`

Requires ethereum bridge (node bridge --dev) to run in order to allow oraclize query

also use testrpc `--mnemonic --accounts 10` to allow stable determination of OAR

Replace OAR in the weather insurance contract with value provided by ether bridge
(note: might not be necessary for newer versions of the bridge)

## Building

Run `truffle compile`, then run `truffle migrate` to deploy the contracts onto your network of choice (default "development").

# Use

run the tests to see the interactions
* Insurance is a basic contract which allows immediate claim and withdrawal for insured customer
* ManualAuthorizationInsurance is a flavour of insurance requiring a third party authorization, from account assigned by contract owner
* WeatherOracleAuthorizationInsurance is a contract where a cloudy weather in dallas retrieved via oraclize will determine if claim is authorized

# Frontend
install the truffle solidity loader:
`npm install truffle-solidity-loader --save-dev`
use `npm run dev` to execute the server at localhost:8080

# process flow
1. insurer issues a contract representing a pool if insurances, seeds it with initial money
2. clients are assigned to contract and upon a payment of premium are added to insured list
3. when a required pool size is reached, insurer issues tokens (ERC20 standard) that it posts on an insurance exchange (open or restricted market)
4. participants purchase tokens from the insurer and the tokens represent a fraction of the contract money pool and premiums
5. insurer can retain a fraction of the tokens, as per its own strategy and can determine the price of tokens initially
6. tokens can be traded in secondary market, with value affected by the number of open claims, risk profile, time to expiry
7. upon expiry of pool participants can trade their tokens for the money+premium stored in pool

claim process
1. when claim is raised, its outcome is referred to authority
2. flavours of contract (manually authorized, oracle-based) allow choise of either using authorized individuals and groops (single, committe, vote pool) or automated claim review (via data source available through oracle)
3. successful claim allows the customer to withdraw the amount insured


# versions

### 0.0.1	
    insurance - methods insure, claim, withdraw only with a participation token, fully collateralized, insure only up to financing pool size
	participation contracts - issue 100 tokens to participants, associate with insurance contract
	presentation to demonstrate the expected flow
	deployed to testrpc
	
### 0.0.2
    integration with oraclize datasource to demo automated confirmation of a claim verification
    pluggable claim verification mechanism
    
### 0.0.3
    working interaction with web ui

### future
    UI for customer and insurance exchange
    identity verification of the insured via estonian id
    association of insurance value with fiat currency exchange price
    deployment to public testnet
