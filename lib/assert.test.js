const assert = require('assert')

const test = require('./test')
const internalAssert = require('./assert')

test({
  callback (t) {
    t.equal({
      actual: typeof internalAssert,
      expected: 'object'
    })
  }
})

test({
  callback (t) {
    t.equal({
      actual: typeof internalAssert.equal,
      expected: 'function'
    })
  }
})

test({
  callback (t) {
    let error

    try {
      internalAssert.equal({
        expected: 1,
        actual: 2
      })
    } catch (e) {
      error = e
    }

    t.equal({
      actual: error.message,
      expected: 'Expected values to be strictly deep-equal:\n\n2 !== 1\n'
    })
  }
})

test({
  callback (t) {
    let error

    try {
      internalAssert.equal('expected', 'actual')
    } catch (e) {
      error = e
    }

    t.equal({
      expected:
        'The only argument of assert.equal should be an argument. Got "string" and "string".',
      actual: error.message
    })
  }
})
