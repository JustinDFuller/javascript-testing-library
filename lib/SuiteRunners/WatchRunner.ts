import _ from 'lodash'
import { format } from 'util'
import chokidar from 'chokidar'

import { Suite } from '../Suite'
import {
  SuitesOptions,
  SuitesFormatter,
  SuitesExitStrategy,
  SuiteRunner
} from './'

interface SuiteMeta {
  suite: Suite
  path: string
}

export class WatchRunner implements SuiteRunner {
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
      throw new Error(format(WatchRunner.INVALID_TEST_ERROR, path))
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
      this.formatter.end()
    } catch (error) {}
  }

  async execute (paths: string[]): Promise<void> {
    // debounce the handler for the cases when many events are fired at once.
    const eventHandler = _.debounce(async () => {
      paths.forEach(path => {
        delete require.cache[path]
      })
      await this.runSuites(this.requireSuites(paths))
    }, 300)

    // promise that never resolves.
    await new Promise(() => {
      chokidar
        .watch(paths, {
          awaitWriteFinish: true
        })
        .on('change', eventHandler)
        .on('add', eventHandler)
    })
  }
}
