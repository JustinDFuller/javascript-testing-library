import { StubOptions } from './Stub'
import { Test, TestOptions, TestExitStrategy, TestFormatter } from './Test'

type AddTestOptions = Pick<TestOptions, 'name' | 'test' | 'stubs'>

interface SuiteOptions {
  name: string
  stubs?: StubOptions[]
}

export interface SuiteFormatter {
  emitSuite(name: string): void
}

export class Suite {
  static readonly NAME_REQUIRED_ERROR = 'Suite requires a name.'
  static readonly ONE_TEST_REQUIRED_ERROR =
    'At least one test is required for each suite.'

  private readonly name: string
  private readonly stubs: StubOptions[]
  private readonly tests: Set<AddTestOptions>

  private formatter: SuiteFormatter & TestFormatter | undefined
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

  private logName (): void {
    this.validateName()

    if (this.formatter && this.formatter.emitSuite) {
      this.formatter.emitSuite(this.name)
    } else {
      throw new Error('No formatter')
    }
  }

  private async executeTests (): Promise<void> {
    for (const testOptions of this.tests) {
      if (this.formatter && this.exitStrategy) {
        const options = {
          ...testOptions,
          formatter: this.formatter,
          exitStrategy: this.exitStrategy,
          stubs: this.stubs.concat(testOptions.stubs || [])
        }
        await new Test(options).execute()
      } else {
        throw new Error('Missing formatter or exit strategy')
      }
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
    formatter: SuiteFormatter & TestFormatter,
    exitStrategy: TestExitStrategy
  ): Promise<void> {
    this.formatter = formatter
    this.exitStrategy = exitStrategy

    this.logName()
    this.validateTests()

    return this.executeTests()
  }
}
