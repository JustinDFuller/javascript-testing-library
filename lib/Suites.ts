import { Suite, SuiteFormatter } from './Suite'

export interface SuitesFormatter extends SuiteFormatter {
  emitFile(filePath: string): void
  end(): void
}

interface SuiteOptions {
  formatter: SuitesFormatter
  paths: string[]
}

interface SuiteMeta {
  suite: Suite
  path: string
}

interface Suites {
  runTests(suites: Suite[]): Promise<void>
  requireSuites(paths: string[]): SuiteMeta[]
  runAll(): Promise<void>
}

export function Suites (options: SuiteOptions): Suites {
  return {
    async runTests (suites: Suite[]): Promise<void> {
      for (const { suite, path } of suites) {
        options.formatter.emitFile(path)
        await suite.runTests(options.formatter)
      }
    },
    requireSuites (paths: string[]): SuiteMeta[] {
      return paths.map(function (path: string) {
        return {
          suite: require(path).suite,
          path: require.resolve(path)
        }
      })
    },
    async runAll (): Promise<void> {
      await this.runTests(this.requireSuites(options.paths))
      options.formatter.end()
    }
  }
}
