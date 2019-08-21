import { Suite } from './Suite'
import { Assert } from './Assert'
import { TestActions } from './test'

const suite = Suite({
  name: 'Assert'
})

suite.addTest({
  name: 'only provides a deep assertion',
  test (t: TestActions) {
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

suite.addTest({
  name: 'accepts an object as the only argument',
  test (t: TestActions) {
    let error

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore: need to do an invalid call to Assert.equal to test the error handling.
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

suite.addTest({
  name: 'does not allow expected to be a typeof',
  test (t: TestActions) {
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

module.exports = {
  suite
}
