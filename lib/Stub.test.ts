import fs from 'fs'
import os from 'os'

import { Suite } from './Suite'
import { Stub } from './Stub'

const suite = Suite({
  name: 'Stub'
})

suite.addTest({
  name: 'allows you to mock the response of an external module',
  async test (t) {
    t.stub({
      module: 'fs',
      method: 'readFile',
      returns (
        file: string,
        _options: string,
        callback: (err: Error | null, res: string) => void
      ) {
        return callback(null, `You are trying to read ${file}`)
      }
    })

    t.stub({
      module: 'fs',
      method: 'readdir',
      returns (
        _directory: string,
        callback: (err: Error | null, files: string[]) => void
      ) {
        return callback(null, ['file in dir'])
      }
    })

    t.stub({
      module: 'os',
      method: 'platform',
      returns () {
        return 'test_platform'
      }
    })

    let actual = []

    actual.push(os.platform())

    const file = await new Promise(function (resolve, reject): void {
      fs.readFile('filename.jpg', 'utf8', function (err, res) {
        if (err) return reject(err)
        resolve(res)
      })
    })

    actual.push(file)

    const dir = await new Promise(function (resolve, reject): void {
      fs.readdir('some_dir', function (err, res) {
        if (err) return reject(err)
        resolve(res)
      })
    })

    actual = actual.concat(dir)

    t.equal({
      expected: [
        'test_platform',
        'You are trying to read filename.jpg',
        'file in dir'
      ],
      actual
    })
  }
})

suite.addTest({
  name:
    'throws an error when accessing an un-stubbed dependency (even if it was stubbed before)',
  test (t) {
    let error

    try {
      fs.readFile('filepath', function (err) {
        throw err
      })
    } catch (e) {
      error = e
    }

    t.equal({
      expected: `${Stub.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR} fs::readFile`,
      actual: error.message
    })
  }
})

suite.addTest({
  name: 'does not allow stubbing an internal module',
  test (t) {
    let error

    try {
      t.stub({
        module: './assert',
        method: 'Assert',
        returns () {
          throw new Error('Assert stub should not have been called')
        }
      })
    } catch (e) {
      error = e
    }

    t.equal({
      expected: Stub.INTERNAL_STUB_ERROR,
      actual: error.message
    })
  }
})

module.exports = {
  suite
}
