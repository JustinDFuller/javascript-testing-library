const { Suite } = require('./Suite')

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
      }).runTests()
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
  name: 'provides a tests test that provides the test function',
  test (t) {
    let error

    try {
      Suite({
        name: '(creating a Suite to test the tests test)'
      })
        .addTest({
          name: '(creating a test inside the tests test)',
          test (_t) {
            _t.equal({
              expected: 1,
              actual: 2
            })
          }
        })
        .runTests()
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
