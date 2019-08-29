import assert from 'assert'
import { boundMethod } from 'autobind-decorator'

import { OptionsValidator } from './OptionsValidator'

export interface AssertOptions {
  readonly expected: any // eslint-disable-line @typescript-eslint/no-explicit-any
  readonly actual: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export class Assert {
  static readonly CALLED_MORE_THAN_ONCE_ERROR =
    'Expected t.equal to only be called once per test.'

  static readonly EQUAL_NOT_CALLED_ERROR =
    'Expected t.equal to be called at least once.'

  static readonly INVALID_OPTIONS_ERROR = OptionsValidator.INVALID_OPTIONS_ERROR
  static readonly NO_TYPE_EXPECTED_ERROR =
    OptionsValidator.NO_TYPE_EXPECTED_ERROR

  private calls: number

  constructor () {
    this.calls = 0
  }

  private throwIfCalledMoreThanOnce (): void | never {
    if (this.calls > 1) {
      throw new Error(Assert.CALLED_MORE_THAN_ONCE_ERROR)
    }
  }

  throwIfNotCalledAtLeastOnce (): void | never {
    if (this.calls === 0) {
      throw new Error(Assert.EQUAL_NOT_CALLED_ERROR)
    }
  }

  @boundMethod
  equal (options: AssertOptions): void | never {
    new OptionsValidator(options).validate()

    this.calls++
    this.throwIfCalledMoreThanOnce()
    assert.deepStrictEqual(options.actual, options.expected)
  }
}
