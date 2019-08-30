import { format } from 'util'

import { TestExitStrategy } from './Test'
import { Suite, SuiteFormatter } from './Suite'

export interface SuitesFormatter extends SuiteFormatter {
  emitFile(filePath: string): void
  emitError(error: Error): void
  end(): void
}

export interface SuitesExitStrategy extends TestExitStrategy {
  end(): void
}

interface SuitesOptions {
  exitStrategy: SuitesExitStrategy
  formatter: SuitesFormatter
  paths: string[]
}

interface SuiteMeta {
  suite: Suite
  path: string
}

export class Suites {
  static readonly INVALID_TEST_ERROR =
    'Invalid test encountered. Make sure suite is exported. Test File: %s'

  private readonly exitStrategy: SuitesExitStrategy
  private readonly formatter: SuitesFormatter
  private readonly paths: string[]

  constructor (options: SuitesOptions) {
    this.exitStrategy = options.exitStrategy
    this.formatter = options.formatter
    this.paths = options.paths
  }

  async runTests (suites: SuiteMeta[]): Promise<void> {
    try {
      for (const { suite, path } of suites) {
        this.formatter.emitFile(path)

        if (!suite || !suite.runTests) {
          throw new Error(format(Suites.INVALID_TEST_ERROR, path))
        }

        await suite.runTests(this.formatter, this.exitStrategy)
      }
    } catch (error) {
      this.formatter.emitError(error)
      this.exitStrategy.testError(error)
    }
  }

  requireSuites (paths: string[]): SuiteMeta[] {
    return paths.map(function (path: string) {
      return {
        suite: require(path).suite,
        path: require.resolve(path)
      }
    })
  }

  async runAll (): Promise<void> {
    await this.runTests(this.requireSuites(this.paths))
    this.formatter.end()
    this.exitStrategy.end()
  }
}
