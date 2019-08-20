const { Suite } = require('./Suite')
const { NoopFormatter } = require('./formatters/noop')

const suite = Suite({
  name: 'Suite'
})

suite.addTest({
  name: 'requires a name',
  test (t) {
    let error

    try {
      Suite({
        tests () {}
      }).runTests(NoopFormatter())
    } catch (e) {
      error = e
    }

    t.equal({
      actual: error.message,
      expected: Suite.NAME_REQUIRED_ERROR
    })
  }
})

suite.addTest({
  name: 'throws an error if there are no tests added',
  test (t) {
    let error

    try {
      Suite({
        name: '(running a suite with no tests)'
      }).runTests(NoopFormatter())
    } catch (e) {
      error = e
    }

    t.equal({
      expected: Suite.ONE_TEST_REQUIRED_ERROR,
      actual: error.message
    })
  }
})

suite.addTest({
  name: 'provides an addTest method that adds a test to the suite',
  async test (t) {
    let error

    try {
      await Suite({
        name: '(creating a Suite to test the addTest method)'
      })
        .addTest({
          name: '(creating a test inside the addTest test)',
          test (_t) {
            _t.equal({
              expected: 1,
              actual: 2
            })
          }
        })
        .runTests(NoopFormatter())
    } catch (e) {
      error = e
    }

    t.equal({
      expected: 'Expected values to be strictly deep-equal:\n\n2 !== 1\n',
      actual: error.message
    })
  }
})

module.exports = {
  suite
}
