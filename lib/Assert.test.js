const { Suite } = require('./suite')
const { Assert } = require('./Assert')

const suite = Suite({
  name: 'Assert',
  tests (test) {
    test({
      name: 'only provides a deep assertion',
      callback (t) {
        let error

        try {
          Assert().equal({
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
      name: 'accepts an object as the only argument',
      callback (t) {
        let error

        try {
          Assert().equal('expected', 'actual')
        } catch (e) {
          error = e
        }

        t.equal({
          expected: Assert.INVALID_OPTIONS_ERROR,
          actual: error.message
        })
      }
    })
    test({
      name: 'does not allow expected to be a typeof',
      callback (t) {
        let error

        try {
          Assert().equal({
            expected: 'string',
            actual: 'object'
          })
        } catch (e) {
          error = e
        }

        t.equal({
          actual: error.message,
          expected: Assert.NO_TYPE_EXPECTED_ERROR
        })
      }
    })
  }
})

module.exports = {
  suite
}
