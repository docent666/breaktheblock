#  \#BreakTheBlock London Insurance Hackathon Entry

#  Team
Mark Painter
Lukasz Musial
Joseph Christopherson
Hugh Karp

# setup
install zeppelin as per https://github.com/OpenZeppelin/zeppelin-solidity
`npm install zeppelin-solidity`
requires ethereum bridge (node bridge --dev) to run in order to allow oraclize query
also use testrpc `--mnemonic --accounts 10` to allow stable determination of OAR
replace OAR in the weather insurance contract with value provided by ether bridge
(note: might not be necessary for newer versions of the bridge)

## Building and the frontend

1. First run `truffle compile`, then run `truffle migrate` to deploy the contracts onto your network of choice (default "development").
1. Then run `npm run dev` to build the app and serve it on http://localhost:8080

#versions
