import { Suite, TestActions } from './'

import { globMatcher } from './glob'

export const suite = new Suite({
  name: 'glob'
})

suite.addTest({
  name: 'returns an array of matched file paths',
  async test (t: TestActions) {
    const expected = [
      '/path/to/current-dir/lib/Assert/index.test.ts',
      '/path/to/current-dir/lib/Test.test.ts'
    ]

    t.stub({
      module: 'process',
      method: 'cwd',
      returns () {
        return '/path/to/current-dir'
      }
    })

    t.stub({
      module: 'fs',
      method: 'readdir',
      returns (dir: string, callback: Function): void {
        if (dir.includes('.ts')) {
          callback(null, [])
          return
        }

        if (dir.includes('Assert')) {
          callback(null, ['index.test.ts'])
          return
        }

        callback(null, ['Test.test.ts', 'Assert'])
      }
    })

    const actual = await globMatcher('lib/**/*.ts')

    t.equal({
      expected,
      actual
    })
  }
})
