const test = require('./test')

module.exports = function suite (options) {
  if (!options.name) {
    throw new Error(`Suite requires a name. Got "${options.name}".`)
  }

  console.log(`\n ${options.name}`)
  options.tests(test)
}
