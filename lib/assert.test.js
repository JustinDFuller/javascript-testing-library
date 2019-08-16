const assert = require('assert')

const suite = require('./suite')
const internalAssert = require('./assert')

suite({
  name: 'Assert',
  tests (test) {
    test({
      name: 'must be an object.',
      callback (t) {
        t.equal({
          actual: typeof internalAssert,
          expected: 'object'
        })
      }
    })

    test({
      name: 'equal must be a function.',
      callback (t) {
        t.equal({
          actual: typeof internalAssert.equal,
          expected: 'function'
        })
      }
    })

    test({
      name: 'must throw a deep assertion error.',
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
      name: 'equal must require an options object.',
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
  }
})
