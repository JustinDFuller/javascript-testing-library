import { Test, TestOptions, TestFormatter } from './test'

interface SuiteOptions {
  name: string
}

type SuiteTestOptions = Omit<TestOptions, 'formatter'>

interface Suite {
  addTest(test: SuiteTestOptions): Suite
  runTests(formatter: SuiteFormatter): Promise<void>
}

export interface SuiteFormatter {
  emitSuite(name: string): TestFormatter
}

export function Suite (options: SuiteOptions): Suite {
  const tests: Set<SuiteTestOptions> = new Set()

  function isNameInvalid (): boolean {
    return !options || !options.name
  }

  function throwNameRequiredError (): never {
    throw new Error(Suite.NAME_REQUIRED_ERROR)
  }

  function validateName (): void | never {
    if (isNameInvalid()) {
      throwNameRequiredError()
    }
  }

  function logName (formatter: SuiteFormatter): TestFormatter {
    validateName()
    return formatter.emitSuite(options.name)
  }

  async function runTests (testFormatter: TestFormatter): Promise<void> {
    for (const test of tests) {
      await Test({ ...test, formatter: testFormatter })
    }
  }

  function validateTests (): void | never {
    if (tests.size === 0) {
      throw new Error(Suite.ONE_TEST_REQUIRED_ERROR)
    }
  }

  return {
    addTest (test: SuiteTestOptions): Suite {
      tests.add(test)
      return this
    },
    runTests (formatter: SuiteFormatter): Promise<void> {
      const testFormatter = logName(formatter)
      validateTests()
      return runTests(testFormatter)
    }
  }
}

Suite.NAME_REQUIRED_ERROR = 'Suite requires a name.'

Suite.ONE_TEST_REQUIRED_ERROR = 'At least one test is required for each suite.'
