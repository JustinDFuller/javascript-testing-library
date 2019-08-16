const { test } = require('./test')

function suite (options) {
  if (!options.name) {
    throw new Error(`Suite requires a name. Got "${options.name}".`)
  }

  console.log(`\n ${options.name}`)
  options.tests(test)
}

suite.NAME_REQUIRED_ERROR = 'Suite requires a name. Got "undefined".'

module.exports = {
  suite
}
