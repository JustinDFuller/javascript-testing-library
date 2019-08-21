import { Suite, SuiteFormatter } from './Suite'

export interface SuitesFormatter extends SuiteFormatter {
  emitFile(filePath: string): void;
  end(): void;
}

interface SuiteOptions {
  formatter: SuitesFormatter;
  paths: string[];
}

export function Suites (options: SuiteOptions) {
  return {
    async runTests (suites: Suite[]) {
      for (let { suite, path } of suites) {
        options.formatter.emitFile(path)
        await suite.runTests(options.formatter)
      }
    },
    requireSuites (paths: string[]) {
      return paths.map(function (path: string) {
        return {
          suite: require(path).suite,
          path: require.resolve(path)
        }
      })
    },
    async runAll () {
      await this.runTests(this.requireSuites(options.paths))
      options.formatter.end()
    }
  }
}

