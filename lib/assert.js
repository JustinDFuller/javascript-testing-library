const assert = require('assert')

module.exports = function () {
  let calls = 0

  return {
    throwIfNotCalledAtLeastOnce () {
      if (calls === 0) {
        throw new Error('Expected t.equal to be called at least once.')
      }
    },
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

      calls++
      assert.deepStrictEqual(options.actual, options.expected)
    }
  }
}
