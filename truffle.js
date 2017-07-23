// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    "tital": {
      network_id: 20170125,
      host: "localhost",
      port: 30303
    },
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    }
  }
}
