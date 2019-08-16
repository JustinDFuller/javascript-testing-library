const { suite } = require('./suite')

suite({
  name: 'Suite',
  tests (test) {
    test({
      name: 'requires a name',
      callback (t) {
        let error

        try {
          suite({
            tests () {}
          })
        } catch (e) {
          error = e
        }

        t.equal({
          actual: error.message,
          expected: suite.NAME_REQUIRED_ERROR
        })
      }
    })

    test({
      name: 'provides a tests callback that provides the test function',
      callback (t) {
        let error

        try {
          suite({
            name: '(creating a suite to test the tests callback)',
            tests (test) {
              test({
                name: '(creating a test inside the tests callback)',
                callback (_t) {
                  _t.equal({
                    expected: 1,
                    actual: 2
                  })
                }
              })
            }
          })
        } catch (e) {
          error = e
        }

        t.equal({
          expected: 'Expected values to be strictly deep-equal:\n\n2 !== 1\n',
          actual: error.message
        })
      }
    })
  }
})
