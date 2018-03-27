var _validator = require('../src/validator')
var wrapper = require('../src/callback-translator')

function validator () {
  var args = Array.prototype.slice.call(arguments, 0)
  return _validator(wrapper, args)
}

module.exports = validator
