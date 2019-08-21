import ora from 'ora'
import path from 'path'
import chalk from 'chalk'
import figures from 'figures'
import symbols from 'log-symbols'

import { TestFormatter } from '../Test'
import { SuitesFormatter } from '../Suites'

const POINTER = chalk.gray.dim(figures.pointer)

function SpinnerFormatter (): SuitesFormatter & TestFormatter {
  const spinner = ora('Running tests.').start()
  spinner.color = 'gray'

  let testCount = 0
  let file: string
  let suite: string
  let test: string
  let nextSuite: string

  function formatTest (): string {
    return `${suite} ${POINTER} ${test}`
  }

  function printLastTest (): void {
    spinner.stopAndPersist({
      symbol: symbols.success,
      text: formatTest()
    })
  }

  return {
    emitFile (filePath): void {
      file = filePath
    },
    emitSuite (name): SuitesFormatter & TestFormatter {
      nextSuite = name
      spinner.text = name
      return this
    },
    emitTest (nextTest): void {
      testCount++

      if (test) {
        printLastTest()
      }

      test = nextTest
      suite = nextSuite
      spinner.start(`${nextSuite} ${POINTER} ${nextTest}`)
    },
    emitError (error: Error): void {
      let stack = ''

      if (error && error.stack) {
        stack = error.stack
          .replace(file, chalk.black.bgYellow(file))
          .replace(new RegExp(path.resolve(process.cwd(), '..'), 'g'), '')
      }

      spinner.stopAndPersist({
        symbol: symbols.error,
        text: `${formatTest()} \n\n${stack}\n`
      })
      process.exit(1)
    },
    end (): void {
      printLastTest()
      spinner.stopAndPersist({
        symbol: symbols.success,
        text: `${testCount} Tests Passed`
      })
      process.exit(0)
    }
  }
}

module.exports = {
  SpinnerFormatter
}
