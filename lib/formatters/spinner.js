const symbols = require('log-symbols')
const ora = require('ora')

function SpinnerFormatter () {
  const spinner = ora('Running tests.').start()
  let testCount = 0
  let suite
  let test
  let nextSuite

  function formatTest () {
    return `${suite} ${test}`
  }

  function printLastTest () {
    spinner.stopAndPersist({
      symbol: symbols.success,
      text: formatTest()
    })
  }

  return {
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
    },
    emitError (error) {
      spinner.stopAndPersist({
        symbol: symbols.error,
        text: `${formatTest()} \n ${error.stack}`
      })
      process.exit(1)
    },
    end () {
      printLastTest()
      spinner.stopAndPersist({
        symbol: symbols.success,
        text: `${testCount} Tests passed`
      })
      process.exit(0)
    }
  }
}

module.exports = {
  SpinnerFormatter
}
