const { Suite } = require('./Suite')
const { Assert } = require('./Assert')

const suite = Suite({
  name: 'Test',
  tests (test) {
    test({
      name: 'provides a t.equal function that performs a deep assertion',
      test (t) {
        let err

        try {
          test({
            name: 'exits with an error when an assertion fails',
            test (t) {
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
      name: 'throws an error if name is not provided',
      test (t) {
        let error

        try {
          test({
            test () {}
          })
        } catch (e) {
          error = e
        }

        t.equal({
          actual: error.message,
          expected: test.NAME_REQUIRED_ERROR
        })
      }
    })

    test({
      name: 'throws an error if t.equal is not called at least once',
      test (t) {
        let error

        try {
          test({
            name: '(not calling t.equal at least once)',
            test () {}
          })
        } catch (e) {
          error = e
        }

        t.equal({
          expected: Assert.EQUAL_NOT_CALLED_ERROR,
          actual: error.message
        })
      }
    })

    test({
      name: 'throws an error if t.equal is called more than once',
      test (t) {
        let error

        try {
          test({
            name: '(calling t.equal twice)',
            test (_t) {
              _t.equal({
                expected: 1,
                actual: 1
              })
              _t.equal({
                expected: 2,
                actual: 1
              })
            }
          })
        } catch (e) {
          error = e
        }

        t.equal({
          expected: Assert.CALLED_MORE_THAN_ONCE_ERROR,
          actual: error.message
        })
      }
    })

    test({
      name: 'handles async functions',
      async test (t) {
        let error

        try {
          await new Promise(function (resolve, reject) {
            setTimeout(function () {
              reject(new Error('Expected error.'))
            })
          })
        } catch (e) {
          error = e
        }

        t.equal({
          expected: 'Expected error.',
          actual: error.message
        })
      }
    })
  }
})

module.exports = {
  suite
}
