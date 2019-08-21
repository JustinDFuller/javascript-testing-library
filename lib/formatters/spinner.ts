const symbols = require('log-symbols')
const figures = require('figures')
const chalk = require('chalk')
const path = require('path')
const ora = require('ora')

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

  function formatTest () {
    return `${suite} ${POINTER} ${test}`
  }

  function printLastTest () {
    spinner.stopAndPersist({
      symbol: symbols.success,
      text: formatTest()
    })
  }

  return {
    emitFile (filePath) {
      file = filePath
    },
    emitSuite (name) {
      nextSuite = name
      spinner.text = name
      return this
    },
    emitTest (nextTest) {
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
    end () {
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
