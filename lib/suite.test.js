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
      name: 'provides a test callback',
      callback (t) {
        let error

        try {
          suite({
            name: 'Suite inside "provides a test callback"',
            tests (test) {
              test({
                name: 'Test inside "provides a test callback"',
                callback (_t) {
                  t.equal({
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
