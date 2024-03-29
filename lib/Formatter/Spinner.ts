import ora from 'ora'
import path from 'path'
import chalk from 'chalk'
import figures from 'figures'
import symbols from 'log-symbols'

import { TestFormatter } from '../Test'
import { SuitesFormatter } from '../SuiteRunners'

interface StopOptions {
  symbol: string
  text: string
}

interface OraSpinner {
  stopAndPersist(options: StopOptions): void
  start(text: string): OraSpinner
  color: string
  text: string
}

export class SpinnerFormatter implements SuitesFormatter, TestFormatter {
  static readonly POINTER = chalk.gray.dim(figures.pointer)

  private readonly spinner: OraSpinner
  private startTime: number
  private testCount = 0
  private file = ''
  private suite = ''
  private test = ''
  private nextSuite = ''

  constructor () {
    this.startTime = Date.now()
    this.spinner = ora('Running tests.').start()
    this.spinner.color = 'gray'
    this.testCount = 0
  }

  private formatTest (): string {
    return `${this.suite} ${SpinnerFormatter.POINTER} ${this.test}`
  }

  private printLastTest (): void {
    this.spinner.stopAndPersist({
      symbol: symbols.success,
      text: this.formatTest()
    })
  }

  private getRuntime (): number {
    return (Date.now() - this.startTime) / 1000
  }

  private reset () {
    this.testCount = 0
  }

  emitFile (filePath: string): void {
    this.file = filePath
  }

  emitSuite (name: string): void {
    this.nextSuite = name
    this.spinner.text = name
  }

  emitTest (nextTest: string): void {
    if (this.testCount === 0) {
      this.startTime = Date.now()
    }

    this.testCount++

    if (this.test) {
      this.printLastTest()
    }

    this.test = nextTest
    this.suite = this.nextSuite
    this.spinner.start(
      `${this.nextSuite} ${SpinnerFormatter.POINTER} ${nextTest}`
    )
  }

  emitError (error: Error): void {
    let stack = ''

    if (error && error.stack) {
      stack = error.stack
        .replace(this.file, chalk.black.bgYellow(this.file))
        .replace(new RegExp(path.resolve(process.cwd(), '..'), 'g'), '')
    }

    this.spinner.stopAndPersist({
      symbol: symbols.error,
      text: `${this.formatTest()} \n\n${stack}\n`
    })

    this.reset()
  }

  end (): void {
    this.printLastTest()
    this.spinner.stopAndPersist({
      symbol: '',
      text: `\n ${
        this.testCount
      } Tests Passed in ${this.getRuntime()} seconds\n`
    })

    this.reset()
  }
}
