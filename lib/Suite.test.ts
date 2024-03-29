import assert from 'assert'

import { Suite, TestActions } from './'
import { NoopFormatter } from './Formatter/Noop'
import { ThrowExitStrategy } from './ExitStrategy/Throw'

export const suite = new Suite({
  name: 'Suite'
})

suite.addTest({
  name: 'requires a name',
  test (t: TestActions) {
    let error

    try {
      new Suite({
        name: ''
      }).execute(new NoopFormatter(), new ThrowExitStrategy())
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
  test (t: TestActions) {
    let error

    try {
      new Suite({
        name: '(running a suite with no tests)'
      }).execute(new NoopFormatter(), new ThrowExitStrategy())
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
  async test (t: TestActions) {
    let error

    try {
      await new Suite({
        name: '(creating a Suite to test the addTest method)'
      })
        .addTest({
          name: '(creating a test inside the addTest test)',
          test (_t: TestActions) {
            _t.equal({
              expected: 1,
              actual: 2
            })
          }
        })
        .execute(new NoopFormatter(), new ThrowExitStrategy())
    } catch (e) {
      error = e
    }

    t.equal({
      expected: assert.AssertionError,
      actual: error.constructor
    })
  }
})
