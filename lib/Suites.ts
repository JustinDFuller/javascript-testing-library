import { Suite, SuiteFormatter } from './Suite'

export interface SuitesFormatter extends SuiteFormatter {
  emitFile(filePath: string): void
  end(): void
}

interface SuitesOptions {
  formatter: SuitesFormatter
  paths: string[]
}

interface SuiteMeta {
  suite: Suite
  path: string
}

export class Suites {
  private readonly formatter: SuitesFormatter
  private readonly paths: string[]

  constructor (options: SuitesOptions) {
    this.formatter = options.formatter
    this.paths = options.paths
  }

  async runTests (suites: SuiteMeta[]): Promise<void> {
    for (const { suite, path } of suites) {
      this.formatter.emitFile(path)
      await suite.runTests(this.formatter)
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
  }
}
