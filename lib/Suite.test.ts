import { Suite } from './Suite'
import { NoopFormatter } from './Formatter/Noop'
import { ThrowExitStrategy } from './ExitStrategy/Throw'

const suite = new Suite({
  name: 'Suite'
})

suite.addTest({
  name: 'requires a name',
  test (t) {
    let error

    try {
      new Suite({
        name: ''
      }).runTests(new NoopFormatter(), new ThrowExitStrategy())
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
      new Suite({
        name: '(running a suite with no tests)'
      }).runTests(new NoopFormatter(), new ThrowExitStrategy())
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
      await new Suite({
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
        .runTests(new NoopFormatter(), new ThrowExitStrategy())
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
