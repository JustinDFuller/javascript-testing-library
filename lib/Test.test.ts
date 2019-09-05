import fs from 'fs'
import assert from 'assert'

import { Test } from './Test'
import { Assert } from './Assert'
import { Suite, TestActions } from './'
import { NoopFormatter } from './Formatter/Noop'
import { ThrowExitStrategy } from './ExitStrategy/Throw'

export const suite = new Suite({
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
      expected: assert.AssertionError,
      actual: err.constructor
    })
  }
})

suite.addTest({
  name: 'throws an error if name is not provided',
  test (t: TestActions) {
    t.throws({
      expected: Test.NAME_REQUIRED_ERROR,
      actual () {
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
      }
    })
  }
})

suite.addTest({
  name: 'throws an error if t.equal is not called at least once',
  test (t: TestActions) {
    t.throws({
      expected: Assert.EQUAL_NOT_CALLED_ERROR,
      actual () {
        new Test({
          formatter: new NoopFormatter(),
          exitStrategy: new ThrowExitStrategy(),
          name: '(not calling t.equal at least once)',
          test (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        }).execute()
      }
    })
  }
})

suite.addTest({
  name: 'throws an error if t.equal is called more than once',
  test (t: TestActions) {
    t.throws({
      expected: Assert.CALLED_MORE_THAN_ONCE_ERROR,
      actual () {
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
      }
    })
  }
})

suite.addTest({
  name: 'handles async functions',
  async test (t: TestActions) {
    class FakeError extends Error {}

    await t.throws({
      expected: FakeError,
      async actual () {
        // eslint-disable-next-line promise/param-names
        await new Promise(function (_resolve, reject): void {
          setTimeout(function () {
            reject(new FakeError())
          })
        })
      }
    })
  }
})

suite.addTest({
  name: 'accepts an array of stubs that are applied before the test is run',
  stubs: [
    {
      module: 'fs',
      method: 'readdir',
      returns (dir: string, callback: Function): void {
        callback(null, [dir])
      }
    }
  ],
  async test (t) {
    const actual = await new Promise(function (resolve): void {
      fs.readdir('dir', (_err: Error | null, res: string[]) => resolve(res))
    })

    t.equal({
      actual,
      expected: ['dir']
    })
  }
})
