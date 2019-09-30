import { format } from 'util'

import { Suite, TestActions } from './'
import { Suites } from './Suites'
import { NoopFormatter } from './Formatter/Noop'
import { ThrowExitStrategy } from './ExitStrategy/Throw'

export const suite = new Suite({
  name: 'Suites'
})

suite.addTest({
  name: 'runs tests in a consistent order',
  async test (t: TestActions) {
    const order: number[] = []

    await new Suites({
      paths: [],
      formatter: new NoopFormatter(),
      exitStrategy: new ThrowExitStrategy()
    }).runSuites([
      {
        path: 'none',
        suite: new Suite({
          name: '(consistent order suite 1)'
        })
          .addTest({
            name: '(consistent order test 1)',
            async test (t: TestActions) {
              await Promise.resolve()
              order.push(1)

              t.equal({
                expected: 1,
                actual: 1
              })
            }
          })
          .addTest({
            name: '(consistent order test 2)',
            test (t: TestActions) {
              order.push(2)

              t.equal({
                expected: 1,
                actual: 1
              })
            }
          })
      },
      {
        path: 'none',
        suite: new Suite({
          name: '(consistent order suite 2)'
        })
          .addTest({
            name: '(consistent order test 3)',
            test (t: TestActions) {
              order.push(3)

              t.equal({
                expected: 1,
                actual: 1
              })
            }
          })
          .addTest({
            name: '(consistent order test 4)',
            test (t: TestActions) {
              order.push(4)

              t.equal({
                expected: 1,
                actual: 1
              })
            }
          })
      }
    ])

    t.equal({
      actual: order,
      expected: [1, 2, 3, 4]
    })
  }
})

suite.addTest({
  name: 'handles invalid test files',
  async test (t: TestActions) {
    const path = '/path/to/file.test.ts'
    let error = new Error('Expected an error to be called')

    try {
      await new Suites({
        paths: [],
        formatter: new NoopFormatter(),
        exitStrategy: new ThrowExitStrategy()
      }).runSuites([
        {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore: need to test an invalid suite
          suite: null,
          path
        }
      ])
    } catch (e) {
      error = e
    }

    t.equal({
      expected: format(Suites.INVALID_TEST_ERROR, path),
      actual: error.message
    })
  }
})
