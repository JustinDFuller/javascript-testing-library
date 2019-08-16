const assert = require('assert')

const internalAssert = require('./assert')

assert.deepStrictEqual(typeof internalAssert, 'object')
assert.deepStrictEqual(typeof internalAssert.equal, 'function')

let error

try {
  internalAssert.equal({
    expected: 1,
    actual: 2
  })
} catch (e) {
  error = e
}

assert.deepStrictEqual(
  error.message,
  'Expected values to be strictly deep-equal:\n\n1 !== 2\n'
)
