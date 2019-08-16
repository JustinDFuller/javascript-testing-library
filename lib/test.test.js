const { suite } = require('./suite')
const { Assert } = require('./Assert')

suite({
  name: 'Test',
  tests (test) {
    test({
      name: 'provides a t.equal function that performs a deep assertion',
      callback (t) {
        let err

        try {
          test({
            name: 'exits with an error when an assertion fails',
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
      name: 'throws an error if name is not provided',
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
          expected: test.NAME_REQUIRED_ERROR
        })
      }
    })

    test({
      name: 'throws an error if t.equal is not called at least once',
      callback (t) {
        let error

        try {
          test({
            name: '(not calling t.equal at least once)',
            callback () {}
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
      callback (t) {
        let error

        try {
          test({
            name: '(calling t.equal twice)',
            callback (_t) {
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
      async callback (t) {
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
