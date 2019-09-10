import fs from 'fs'
import ts from 'typescript'

import { Suite, TestActions } from '../'
import { Module, StubNotUsedError, StubbedTwiceError } from './Module'

import { NoopFormatter } from '../Formatter/Noop'
import { ThrowExitStrategy } from '../ExitStrategy/Throw'

export const suite = new Suite({
  name: 'Stub'
})

suite.addTest({
  name: 'allows you to mock the response of an external module',
  stubs: [
    {
      module: 'fs',
      method: 'readFile',
      returns (
        file: string,
        _options: string,
        callback: (err: Error | null, res: string) => void
      ): void {
        callback(null, `You are trying to read ${file}`)
      }
    }
  ],
  async test (t: TestActions) {
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
  name: 'does not allow stubbing an internal module',
  async test (t: TestActions) {
    let error = new Error('Expected an error to be thrown.')

    try {
      await new Suite({
        name: '(stubbing internal module)'
      })
        .addTest({
          name: '(stubbing internal module)',
          stubs: [
            {
              module: './assert',
              method: 'Assert',
              returns (): never {
                throw new Error('Assert stub should not have been called')
              }
            }
          ],
          test (_t: TestActions) {
            _t.equal({
              expected: 1,
              actual: 1
            })
          }
        })
        .execute(new NoopFormatter(), new ThrowExitStrategy())
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
  name: 'automatically restores modules that were mocked',
  async test (t: TestActions) {
    let error

    try {
      await new Suite({
        name: '(testing mock restoration)'
      })
        .addTest({
          name: '(mocking typescript)',
          stubs: [
            {
              module: 'typescript',
              method: 'transpileModule',
              returns (): object {
                return {
                  outputText: 'fake output text'
                }
              }
            }
          ],
          test (_t: TestActions) {
            const { outputText } = ts.transpileModule('let test = 1', {})

            _t.equal({
              expected: 'fake output text',
              actual: outputText
            })
          }
        })
        .addTest({
          name: '(using typescript transpileModule without stubbing it)',
          test (_t: TestActions) {
            const { outputText } = ts.transpileModule('let test = 1', {})

            _t.equal({
              expected: 'var test = 1;\n',
              actual: outputText
            })
          }
        })
        .execute(new NoopFormatter(), new ThrowExitStrategy())
    } catch (e) {
      error = e
    }

    t.equal({
      expected: undefined,
      actual: error
    })
  }
})

suite.addTest({
  name: 'throws an error for un-used stubs',
  async test (t) {
    let error = new Error('Expected an error to be thrown')

    try {
      await new Suite({ name: '(un-used stub)' })
        .addTest({
          name: '(un-used stub)',
          stubs: [
            {
              module: 'typescript',
              method: 'transpileModule',
              returns (): void {
                return undefined
              }
            }
          ],
          test (_t) {
            _t.equal({
              expected: 1,
              actual: 1
            })
          }
        })
        .execute(new NoopFormatter(), new ThrowExitStrategy())
    } catch (e) {
      error = e
    }

    t.equal({
      actual: error instanceof StubNotUsedError,
      expected: true
    })
  }
})

suite.addTest({
  name: 'throws an error for un-used stubs of auto-stubbed modules',
  async test (t) {
    let error = new Error('Expected an error to be thrown')

    try {
      await new Suite({ name: '(un-used stub)' })
        .addTest({
          name: '(un-used stub)',
          stubs: [
            {
              module: 'fs',
              method: 'readdir',
              returns (): void {
                return undefined
              }
            }
          ],
          test (_t) {
            _t.equal({
              expected: 1,
              actual: 1
            })
          }
        })
        .execute(new NoopFormatter(), new ThrowExitStrategy())
    } catch (e) {
      error = e
    }

    t.equal({
      actual: error instanceof StubNotUsedError,
      expected: true
    })
  }
})

suite.addTest({
  name: 'throws an error when a stub is created twice',
  async test (t) {
    await t.throws({
      expected: StubbedTwiceError,
      async actual () {
        await new Suite({ name: '(stub created twice)' })
          .addTest({
            name: '(stub created twice)',
            stubs: [
              {
                module: 'fs',
                method: 'readdir',
                returns (): void {
                  return undefined
                }
              },
              {
                module: 'fs',
                method: 'readdir',
                returns (): void {
                  return undefined
                }
              }
            ],
            test (_t) {
              _t.equal({
                expected: 1,
                actual: 1
              })
            }
          })
          .execute(new NoopFormatter(), new ThrowExitStrategy())
      }
    })
  }
})
