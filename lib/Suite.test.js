const { Suite } = require('./Suite')

Suite({
  name: 'Suite',
  tests (test) {
    test({
      name: 'requires a name',
      callback (t) {
        let error

        try {
          Suite({
            tests () {}
          })
        } catch (e) {
          error = e
        }

        t.equal({
          actual: error.message,
          expected: Suite.NAME_REQUIRED_ERROR
        })
      }
    })

    test({
      name: 'provides a tests callback that provides the test function',
      callback (t) {
        let error

        try {
          Suite({
            name: '(creating a Suite to test the tests callback)',
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
