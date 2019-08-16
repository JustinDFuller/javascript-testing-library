const { Test } = require('./test')

function Suite (options) {
  let tests = new Set()

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
    tests.forEach(Test)
  }

  return {
    addTest (test) {
      tests.add(test)
      return this
    },
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
