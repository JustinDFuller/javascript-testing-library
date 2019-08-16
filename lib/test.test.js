const suite = require('./suite')

suite({
  name: 'Test',
  tests (test) {
    test({
      name: 'must be a function',
      callback (t) {
        t.equal({
          expected: 'function',
          actual: typeof test
        })
      }
    })

    test({
      name: 't.equal must be a deep assertion.',
      callback (t) {
        let err

        try {
          test({
            name: 'Verifying an internal error scenario.',
            callback (t) {
              t.equal({
                expected: 1,
                actual: 2
              })
            }
          })
        } catch (e) {
          err = e
        }

        t.equal({
          expected: 'Expected values to be strictly deep-equal:\n\n2 !== 1\n',
          actual: err.message
        })
      }
    })

    test({
      name: 'must require a name.',
      callback (t) {
        let error

        try {
          test({
            callback () {}
          })
        } catch (e) {
          error = e
        }

        t.equal({
          actual: error.message,
          expected: 'Each test must have a name. Received "undefined".'
        })
      }
    })
  }
})
