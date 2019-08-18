const { Test } = require('./test')

function Suite (options) {
  let tests = new Set()

  function isNameInvalid () {
    return !options || !options.name
  }

  function throwNameRequiredError () {
    throw new Error(Suite.NAME_REQUIRED_ERROR)
  }

  function validateName () {
    if (isNameInvalid()) {
      throwNameRequiredError()
    }
  }

  function logName () {
    validateName()
    console.log(`\n ${options.name}`)
  }

  async function runTests () {
    for (let test of tests) {
      await Test(test)
    }
  }

  function validateTests () {
    if (tests.size === 0) {
      throw new Error(Suite.ONE_TEST_REQUIRED_ERROR)
    }
  }

  return {
    addTest (test) {
      tests.add(test)
      return this
    },
    runTests () {
      logName()
      validateTests()
      return runTests()
    }
  }
}

Suite.NAME_REQUIRED_ERROR = 'Suite requires a name.'

Suite.ONE_TEST_REQUIRED_ERROR = 'At least one test is required for each suite.'

module.exports = {
  Suite
}
