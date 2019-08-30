import { Suite, SuiteFormatter } from './Suite'
import { TestExitStrategy } from './Test'

export interface SuitesFormatter extends SuiteFormatter {
  emitFile(filePath: string): void
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
  private readonly exitStrategy: SuitesExitStrategy
  private readonly formatter: SuitesFormatter
  private readonly paths: string[]

  constructor (options: SuitesOptions) {
    this.exitStrategy = options.exitStrategy
    this.formatter = options.formatter
    this.paths = options.paths
  }

  async runTests (suites: SuiteMeta[]): Promise<void> {
    for (const { suite, path } of suites) {
      this.formatter.emitFile(path)
      await suite.runTests(this.formatter, this.exitStrategy)
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
