var _balance = require('../src/balance')
var wrapper = require('../src/callback-translator')

function balance (policy) {
  return _balance(wrapper, policy)
}

module.exports = balance
