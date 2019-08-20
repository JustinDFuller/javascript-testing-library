const symbols = require('log-symbols')
const figures = require('figures')
const chalk = require('chalk')
const ora = require('ora')

const POINTER = chalk.gray.dim(figures.pointer)

function SpinnerFormatter () {
  const spinner = ora('Running tests.').start()
  spinner.color = 'gray'

  let testCount = 0
  let file
  let suite
  let test
  let nextSuite

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
    emitError (error) {
      spinner.stopAndPersist({
        symbol: symbols.error,
        text: `${formatTest()} \n\n${error.stack.replace(
          file,
          chalk.black.bgYellow(file)
        )}\n`
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
