import fs from 'fs'
import ts from 'typescript'

import { Suite } from '../Suite'
import { Module } from './Module'
import { NoopFormatter } from '../formatters/noop'
import { UnstubbedDependency } from './UnstubbedDependency'

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
      expected: `${
        UnstubbedDependency.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
      } fs::readFile`,
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
      expected: Module.INTERNAL_STUB_ERROR,
      actual: error.message
    })
  }
})

suite.addTest({
  name: 'automatically mocks the HTTP module',
  async test (t) {
    let error

    try {
      await require('http').request('http://github.com')
    } catch (e) {
      error = e
    }

    t.equal({
      expected: `${
        UnstubbedDependency.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
      } http::request`,
      actual: error.message
    })
  }
})

suite.addTest({
  name: 'automatically mocks the HTTP/2 module',
  async test (t) {
    let error

    try {
      await require('http2').createServer()
    } catch (e) {
      error = e
    }

    t.equal({
      expected: `${
        UnstubbedDependency.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
      } http2::createServer`,
      actual: error.message
    })
  }
})

suite.addTest({
  name: 'automatically mocks the net module',
  async test (t) {
    let error

    try {
      await require('net').connect()
    } catch (e) {
      error = e
    }

    t.equal({
      expected: `${
        UnstubbedDependency.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
      } net::connect`,
      actual: error.message
    })
  }
})

suite.addTest({
  name: 'automatically mocks the dns module',
  async test (t) {
    let error

    try {
      await require('dns').resolve()
    } catch (e) {
      error = e
    }

    t.equal({
      expected: `${
        UnstubbedDependency.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
      } dns::resolve`,
      actual: error.message
    })
  }
})

suite.addTest({
  name: 'automatically mocks the tls module',
  async test (t) {
    let error

    try {
      await require('tls').connect()
    } catch (e) {
      error = e
    }

    t.equal({
      expected: `${
        UnstubbedDependency.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
      } tls::connect`,
      actual: error.message
    })
  }
})

suite.addTest({
  name: 'automatically restores modules that were mocked',
  async test (t) {
    let error

    try {
      await Suite({
        name: '(testing mock restoration)'
      })
        .addTest({
          name: '(mocking typescript)',
          test (t) {
            t.stub({
              module: 'typescript',
              method: 'transpileModule',
              returns () {
                return {
                  outputText: 'fake output text'
                }
              }
            })

            const { outputText } = ts.transpileModule('let test = 1', {})

            t.equal({
              expected: 'fake output text',
              actual: outputText
            })
          }
        })
        .addTest({
          name: '(using typescript transpileModule without stubbing it)',
          test (t) {
            const { outputText } = ts.transpileModule('let test = 1', {})

            t.equal({
              expected: 'var test = 1;\n',
              actual: outputText
            })
          }
        })
        .runTests(NoopFormatter())
    } catch (e) {
      error = e
    }

    t.equal({
      expected: undefined,
      actual: error
    })
  }
})

module.exports = {
  suite
}
