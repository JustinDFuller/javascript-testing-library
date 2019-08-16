const assert = require('assert')

module.exports = {
  equal (options) {
    if (typeof options !== 'object') {
      let message =
        'The only argument of assert.equal should be an argument. Got '

      message += Array.from(arguments)
        .map(function (val) {
          return `"${typeof val}"`
        })
        .join(' and ')

      message += '.'
      throw new Error(message)
    }
    assert.deepStrictEqual(options.actual, options.expected)
  }
}
