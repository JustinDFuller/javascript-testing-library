import fs from 'fs'
import { promisify } from 'util'

import { Suite, TestActions } from './'
import { NoopFormatter } from './Formatter/Noop'
import { ThrowExitStrategy } from './ExitStrategy/Throw'

const suite = new Suite({
  name: 'Suite',
  stubs: [
    {
      module: 'fs',
      method: 'readFile',
      returns (filePath: string, callback: Function) {
        callback(null, filePath)
      }
    },
    {
      module: 'fs',
      method: 'stat',
      returns (filePath: string, callback: Function) {
        callback(null, filePath)
      }
    }
  ]
})

suite.addTest({
  name: 'requires a name',
  test (t: TestActions) {
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
  test (t: TestActions) {
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

suite.addTest({
  name: 'accepts an array of stubs that are applied before the test is run',
  async test (t: TestActions) {
    const readFile = promisify(fs.readFile)
    const stat = promisify(fs.stat)

    const actual = await stat(await readFile('file_path'))

    t.equal({
      actual,
      expected: 'file_path'
    })
  }
})

module.exports = {
  suite
}
