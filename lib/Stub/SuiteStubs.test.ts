import fs from 'fs'
import { promisify } from 'util'

import { Suite, TestActions } from '../'

export const suite = new Suite({
  name: 'Suite stubs',
  stubs: [
    {
      module: 'fs',
      method: 'readFile',
      returns (filePath: string, callback: Function): void {
        callback(null, filePath)
      }
    },
    {
      module: 'fs',
      method: 'stat',
      returns (filePath: string, callback: Function): void {
        callback(null, filePath)
      }
    }
  ]
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
