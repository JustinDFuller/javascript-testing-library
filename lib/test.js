const { Assert } = require('./Assert')

function test ({ name, callback }) {
  if (!name) {
    throw new Error(`Each test must have a name.`)
  }

  const assert = Assert()
  console.log(`  ${name}`)
  callback(assert)
  assert.throwIfNotCalledAtLeastOnce()
}

test.NAME_REQUIRED_ERROR = 'Each test must have a name.'

module.exports = {
  test
}
