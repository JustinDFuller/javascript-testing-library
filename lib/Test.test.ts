import { Test } from './Test'
import { Assert } from './Assert'
import { Suite, TestActions } from './'
import { NoopFormatter } from './Formatter/Noop'
import { ThrowExitStrategy } from './ExitStrategy/Throw'

const suite = new Suite({
  name: 'Test'
})

suite.addTest({
  name: 'provides a t.equal function that performs a deep assertion',
  test (t: TestActions) {
    let err

    try {
      new Test({
        formatter: new NoopFormatter(),
        exitStrategy: new ThrowExitStrategy(),
        name: 'exits with an error when an assertion fails',
        test (t): void {
          t.equal({
            expected: 1,
            actual: 2
          })
        }
      }).execute()
    } catch (e) {
      err = e
    }

    t.equal({
      expected: 'Expected values to be strictly deep-equal:\n\n2 !== 1\n',
      actual: err.message
    })
  }
})

suite.addTest({
  name: 'throws an error if name is not provided',
  test (t: TestActions) {
    let error

    try {
      new Test({
        formatter: new NoopFormatter(),
        exitStrategy: new ThrowExitStrategy(),
        name: '',
        test (t: TestActions): void {
          t.equal({
            expected: 1,
            actual: 2
          })
        }
      }).execute()
    } catch (e) {
      error = e
    }

    t.equal({
      actual: error.message,
      expected: Test.NAME_REQUIRED_ERROR
    })
  }
})

suite.addTest({
  name: 'throws an error if t.equal is not called at least once',
  test (t: TestActions) {
    let error

    try {
      new Test({
        formatter: new NoopFormatter(),
        exitStrategy: new ThrowExitStrategy(),
        name: '(not calling t.equal at least once)',
        test (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
      }).execute()
    } catch (e) {
      error = e
    }

    t.equal({
      expected: Assert.EQUAL_NOT_CALLED_ERROR,
      actual: error.message
    })
  }
})

suite.addTest({
  name: 'throws an error if t.equal is called more than once',
  test (t: TestActions) {
    let error

    try {
      new Test({
        formatter: new NoopFormatter(),
        exitStrategy: new ThrowExitStrategy(),
        name: '(calling t.equal twice)',
        test (_t): void {
          _t.equal({
            expected: 1,
            actual: 1
          })
          _t.equal({
            expected: 2,
            actual: 1
          })
        }
      }).execute()
    } catch (e) {
      error = e
    }

    t.equal({
      expected: Assert.CALLED_MORE_THAN_ONCE_ERROR,
      actual: error.message
    })
  }
})

suite.addTest({
  name: 'handles async functions',
  async test (t: TestActions) {
    let error

    try {
      // eslint-disable-next-line promise/param-names
      await new Promise(function (_resolve, reject): void {
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

module.exports = {
  suite
}
