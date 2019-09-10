import { extname } from 'path'
import { format } from 'util'
import { register } from 'ts-node'

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
  static registered = false
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

  private requireSuite (path: string): SuiteMeta {
    if (!Suites.registered && extname(path) === '.ts') {
      Suites.registered = true
      register()
    }

    return {
      suite: require(path).suite,
      path: require.resolve(path)
    }
  }

  private async runSuite (suiteMeta: SuiteMeta): Promise<void> {
    const { path, suite } = suiteMeta
    this.formatter.emitFile(path)

    if (!suite || !suite.execute) {
      throw new Error(format(Suites.INVALID_TEST_ERROR, path))
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

  async execute (): Promise<void> {
    await this.runSuites(this.requireSuites(this.paths))
    this.formatter.end()
    this.exitStrategy.end()
  }
}
