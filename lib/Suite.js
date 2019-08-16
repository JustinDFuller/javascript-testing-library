const { test } = require('./test')

function Suite (options) {
  function isNameInvalid () {
    return !options.name
  }

  function throwNameRequiredError () {
    throw new Error(Suite.NAME_REQUIRED_ERROR)
  }

  function validate () {
    if (isNameInvalid()) {
      throwNameRequiredError()
    }
  }

  function logName () {
    validate()
    console.log(`\n ${options.name}`)
  }

  function runTests () {
    options.tests(test)
  }

  return {
    runTests () {
      logName()
      runTests()
    }
  }
}

Suite.NAME_REQUIRED_ERROR = 'Suite requires a name.'

module.exports = {
  Suite
}
