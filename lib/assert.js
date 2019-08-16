const assert = require('assert')

module.exports = {
  equal (options) {
    assert.deepStrictEqual(options.expected, options.actual)
  }
}
