const { Assert } = require('./Assert')

function test ({ name, callback }) {
  if (!name) {
    throw new Error(`Each test must have a name. Received "${name}".`)
  }

  const assert = Assert()
  console.log(`  ${name}`)
  callback(assert)
  assert.throwIfNotCalledAtLeastOnce()
}

module.exports = {
  test
}
