import { Test, TestOptions, TestFormatter, TestExitStrategy } from './Test'

type AddTestOptions = Pick<TestOptions, 'name' | 'test' | 'stubs'>

interface SuiteOptions {
  name: string
}

export interface SuiteFormatter {
  emitSuite(name: string): TestFormatter
}

export class Suite {
  static readonly NAME_REQUIRED_ERROR = 'Suite requires a name.'
  static readonly ONE_TEST_REQUIRED_ERROR =
    'At least one test is required for each suite.'

  private readonly name: string
  private readonly tests: Set<AddTestOptions>

  constructor (options: SuiteOptions) {
    this.tests = new Set()
    this.name = options.name
  }

  private isNameInvalid (): boolean {
    return !this.name
  }

  private throwNameRequiredError (): never {
    throw new Error(Suite.NAME_REQUIRED_ERROR)
  }

  private validateName (): void | never {
    if (this.isNameInvalid()) {
      this.throwNameRequiredError()
    }
  }

  private logName (formatter: SuiteFormatter): TestFormatter {
    this.validateName()
    return formatter.emitSuite(this.name)
  }

  private async executeTests (
    testFormatter: TestFormatter,
    exitStrategy: TestExitStrategy
  ): Promise<void> {
    const formatter = testFormatter

    for (const testOptions of this.tests) {
      await new Test({ ...testOptions, formatter, exitStrategy }).execute()
    }
  }

  private validateTests (): void | never {
    if (this.tests.size === 0) {
      throw new Error(Suite.ONE_TEST_REQUIRED_ERROR)
    }
  }

  addTest (addTestOptions: AddTestOptions): Suite {
    this.tests.add(addTestOptions)
    return this
  }

  runTests (
    formatter: SuiteFormatter,
    exitStrategy: TestExitStrategy
  ): Promise<void> {
    const testFormatter = this.logName(formatter)
    this.validateTests()
    return this.executeTests(testFormatter, exitStrategy)
  }
}
