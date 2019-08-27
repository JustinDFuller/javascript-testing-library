import fs from 'fs'

import { Suite } from '../Suite'
import { Stub } from './'

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

    const actual = await new Promise(function (resolve, reject): void {
      fs.readFile('filename.jpg', 'utf8', function (err, res) {
        if (err) return reject(err)
        resolve(res)
      })
    })

    t.equal({
      expected: 'You are trying to read filename.jpg',
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

/* suite.addTest({
  name: 'automatically restores functions',
  test() {

  }
}) */

module.exports = {
  suite
}
