import assert from 'assert'

import { Assert } from './'
import { Suite, TestActions } from '../'

export const suite = new Suite({
  name: 'Assert'
})

suite.addTest({
  name: 'provides a deep assertion',
  test (t: TestActions) {
    let error

    try {
      new Assert().equal({
        expected: 1,
        actual: 2
      })
    } catch (e) {
      error = e
    }

    t.equal({
      actual: error.constructor,
      expected: assert.AssertionError
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
      new Assert().equal('expected', 'actual')
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
      new Assert().equal({
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
