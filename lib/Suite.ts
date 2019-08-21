import { Test, TestOptions, TestFormatter } from './test'

interface SuiteOptions {
  name: string
}

export interface SuiteFormatter {
  emitSuite(name: string): TestFormatter
}

export function Suite (options: SuiteOptions) {
  let tests: Set<TestOptions> = new Set()

  function isNameInvalid () {
    return !options || !options.name
  }

  function throwNameRequiredError () {
    throw new Error(Suite.NAME_REQUIRED_ERROR)
  }

  function validateName () {
    if (isNameInvalid()) {
      throwNameRequiredError()
    }
  }

  function logName (formatter: SuiteFormatter): TestFormatter {
    validateName()
    return formatter.emitSuite(options.name)
  }

  async function runTests (testFormatter: TestFormatter) {
    for (let test of tests) {
      await Test(test, testFormatter)
    }
  }

  function validateTests () {
    if (tests.size === 0) {
      throw new Error(Suite.ONE_TEST_REQUIRED_ERROR)
    }
  }

  return {
    addTest (test: TestOptions) {
      tests.add(test)
      return this
    },
    runTests (formatter: SuiteFormatter) {
      const testFormatter = logName(formatter)
      validateTests()
      return runTests(testFormatter)
    }
  }
}

Suite.NAME_REQUIRED_ERROR = 'Suite requires a name.'

Suite.ONE_TEST_REQUIRED_ERROR = 'At least one test is required for each suite.'
