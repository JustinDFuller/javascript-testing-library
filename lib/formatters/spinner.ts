import ora from 'ora'
import path from 'path'
import chalk from 'chalk'
import figures from 'figures'
import symbols from 'log-symbols'

import { TestFormatter } from '../Test'
import { SuitesFormatter } from '../Suites'

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
  private testCount = 0
  private file = ''
  private suite = ''
  private test = ''
  private nextSuite = ''

  constructor () {
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

  emitFile (filePath: string): void {
    this.file = filePath
  }

  emitSuite (name: string): SuitesFormatter & TestFormatter {
    this.nextSuite = name
    this.spinner.text = name
    return this
  }

  emitTest (nextTest: string): void {
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
    process.exit(1)
  }

  end (): void {
    this.printLastTest()
    this.spinner.stopAndPersist({
      symbol: symbols.success,
      text: `${this.testCount} Tests Passed`
    })
    process.exit(0)
  }
}
