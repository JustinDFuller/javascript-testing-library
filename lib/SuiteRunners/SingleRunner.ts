import { format } from 'util'

import { Suite } from '../Suite'
import { SuitesOptions, SuitesFormatter, SuitesExitStrategy, SuiteRunner } from './'

interface SuiteMeta {
  suite: Suite
  path: string
}

export class SingleRunner implements SuiteRunner {
  static registered = false
  static readonly INVALID_TEST_ERROR =
    'Invalid test encountered. Make sure suite is exported. Test File: %s'

  private readonly exitStrategy: SuitesExitStrategy
  private readonly formatter: SuitesFormatter

  constructor (options: SuitesOptions) {
    this.exitStrategy = options.exitStrategy
    this.formatter = options.formatter
  }

  private requireSuite (path: string): SuiteMeta {
    return {
      suite: require(path).suite,
      path: require.resolve(path)
    }
  }

  private async runSuite (suiteMeta: SuiteMeta): Promise<void> {
    const { path, suite } = suiteMeta
    this.formatter.emitFile(path)

    if (!suite || !suite.execute) {
      throw new Error(format(SingleRunner.INVALID_TEST_ERROR, path))
    }

    await suite.execute(this.formatter, this.exitStrategy)
  }

  private requireSuites (paths: string[]): SuiteMeta[] {
    return paths.map(this.requireSuite)
  }

  async runSuites (suites: SuiteMeta[]): Promise<void> {
    try {
      for (const suite of suites) {
        await this.runSuite(suite)
      }
    } catch (error) {
      this.formatter.emitError(error)
      this.exitStrategy.testError(error)
    }
  }

  async execute (paths: string[]): Promise<void> {
    await this.runSuites(this.requireSuites(paths))
    this.formatter.end()
    this.exitStrategy.end()
  }
}
