const assert = require('assert')

const TYPES = [
  'string',
  'object',
  'number',
  'boolean',
  'symbol',
  'function',
  'bigint',
  'undefined'
]

function AssertOptions (options) {
  function isInvalid () {
    return typeof options !== 'object'
  }

  function throwInvalidError () {
    throw new Error(Assert.INVALID_OPTIONS_ERROR)
  }

  function usesTypeofAsExpected () {
    return TYPES.includes(options.expected)
  }

  function throwTypeofAsExpectedError () {
    throw new Error(Assert.NO_TYPE_EXPECTED_ERROR)
  }

  return {
    validate () {
      if (isInvalid()) {
        throwInvalidError()
      }

      if (usesTypeofAsExpected()) {
        throwTypeofAsExpectedError()
      }
    }
  }
}

function Assert () {
  let calls = 0

  return {
    throwIfNotCalledAtLeastOnce () {
      if (calls === 0) {
        throw new Error('Expected t.equal to be called at least once.')
      }
    },
    equal (options) {
      AssertOptions(options).validate()

      calls++
      assert.deepStrictEqual(options.actual, options.expected)
    }
  }
}

Assert.INVALID_OPTIONS_ERROR =
  'The only argument of t.equal should be an object.'

Assert.NO_TYPE_EXPECTED_ERROR =
  'You cannot use a typeof as the expected argument of t.equal().'

module.exports = Assert
