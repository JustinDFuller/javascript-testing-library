const { test } = require('./test')

function SuiteOptions (options) {
  function isNameInvalid () {
    return !options.name
  }

  function throwNameRequiredError () {
    throw new Error(suite.NAME_REQUIRED_ERROR)
  }

  function validate () {
    if (isNameInvalid()) {
      throwNameRequiredError()
    }

    return this
  }

  return {
    logName () {
      validate()
      console.log(`\n ${options.name}`)
      return this
    },
    runTests () {
      options.tests(test)
    }
  }
}

function suite (options) {
  SuiteOptions(options)
    .logName()
    .runTests()
}

suite.NAME_REQUIRED_ERROR = 'Suite requires a name.'

module.exports = {
  suite
}
