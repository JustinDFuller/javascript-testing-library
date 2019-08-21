import assert from 'assert'

const TYPES = [
  'string',
  'object',
  'number',
  'boolean',
  'symbol',
  'function',
  'bigint',
  'undefined'
]

const CALLED_MORE_THAN_ONCE_ERROR =
  'Expected t.equal to only be called once per test.'

const EQUAL_NOT_CALLED_ERROR = 'Expected t.equal to be called at least once.'

const INVALID_OPTIONS_ERROR =
  'The only argument of t.equal should be an object.'

const NO_TYPE_EXPECTED_ERROR =
  'You cannot use a typeof as the expected argument of t.equal().'

export interface AssertOptions {
  readonly expected: any // eslint-disable-line @typescript-eslint/no-explicit-any
  readonly actual: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface AssertOptionsValidator {
  validate(): void | never
}

function AssertOptionsValidator (
  options: AssertOptions
): AssertOptionsValidator {
  function isInvalid (): boolean {
    return typeof options !== 'object'
  }

  function throwInvalidError (): never {
    throw new Error(INVALID_OPTIONS_ERROR)
  }

  function usesTypeofAsExpected (): boolean {
    return TYPES.includes(options.expected)
  }

  function throwTypeofAsExpectedError (): never {
    throw new Error(NO_TYPE_EXPECTED_ERROR)
  }

  return {
    validate (): void | never {
      if (isInvalid()) {
        throwInvalidError()
      }

      if (usesTypeofAsExpected()) {
        throwTypeofAsExpectedError()
      }
    }
  }
}

interface Assert {
  throwIfNotCalledAtLeastOnce(): void | never
  equal(options: AssertOptions): void | never
}

export function Assert (): Assert {
  let calls = 0

  function throwIfCalledMoreThanOnce (): void | never {
    if (calls > 1) {
      throw new Error(CALLED_MORE_THAN_ONCE_ERROR)
    }
  }

  return {
    throwIfNotCalledAtLeastOnce (): void | never {
      if (calls === 0) {
        throw new Error(EQUAL_NOT_CALLED_ERROR)
      }
    },
    equal (options: AssertOptions): void | never {
      AssertOptionsValidator(options).validate()

      calls++
      throwIfCalledMoreThanOnce()
      assert.deepStrictEqual(options.actual, options.expected)
    }
  }
}

Assert.CALLED_MORE_THAN_ONCE_ERROR = CALLED_MORE_THAN_ONCE_ERROR

Assert.EQUAL_NOT_CALLED_ERROR = EQUAL_NOT_CALLED_ERROR

Assert.INVALID_OPTIONS_ERROR = INVALID_OPTIONS_ERROR

Assert.NO_TYPE_EXPECTED_ERROR = NO_TYPE_EXPECTED_ERROR
