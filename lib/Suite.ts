import { StubOptions } from './Stub'
import { Test, TestOptions, TestFormatter, TestExitStrategy } from './Test'

type AddTestOptions = Pick<TestOptions, 'name' | 'test' | 'stubs'>

interface SuiteOptions {
  name: string
  stubs?: StubOptions[]
}

export interface SuiteFormatter {
  emitSuite(name: string): TestFormatter
}

export class Suite {
  static readonly NAME_REQUIRED_ERROR = 'Suite requires a name.'
  static readonly ONE_TEST_REQUIRED_ERROR =
    'At least one test is required for each suite.'

  private readonly name: string
  private readonly stubs: StubOptions[]
  private readonly tests: Set<AddTestOptions>

  private formatter: SuiteFormatter | undefined
  private exitStrategy: TestExitStrategy | undefined

  constructor (options: SuiteOptions) {
    this.tests = new Set()
    this.name = options.name
    this.stubs = options.stubs || []
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

  private logName (): TestFormatter {
    this.validateName()

    if (this.formatter && this.formatter.emitSuite) {
      return this.formatter.emitSuite(this.name)
    }

    throw new Error('No formatter')
  }

  private async executeTests (
    testFormatter: TestFormatter,
    exitStrategy: TestExitStrategy
  ): Promise<void> {
    const formatter = testFormatter

    for (const testOptions of this.tests) {
      const options = {
        ...testOptions,
        formatter,
        exitStrategy,
        stubs: this.stubs.concat(testOptions.stubs || [])
      }
      await new Test(options).execute()
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

  execute (
    formatter: SuiteFormatter,
    exitStrategy: TestExitStrategy
  ): Promise<void> {
    this.formatter = formatter
    this.exitStrategy = exitStrategy

    const testFormatter = this.logName()
    this.validateTests()
    return this.executeTests(testFormatter, this.exitStrategy)
  }
}
