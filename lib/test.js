const Assertion = require('./assert')

module.exports = function test ({ name, callback }) {
  if (!name) {
    throw new Error(`Each test must have a name. Received "${name}".`)
  }

  const assert = Assertion()
  console.log(`  ${name}`)
  callback(assert)
  assert.throwIfNotCalledAtLeastOnce()
}
