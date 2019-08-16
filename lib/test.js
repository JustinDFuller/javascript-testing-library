const { Assert } = require('./Assert')

function test ({ name, callback }) {
  if (!name) {
    throw new Error(`Each test must have a name.`)
  }

  const assert = Assert()
  console.log(`  ${name}`)
  const promise = callback(assert)

  if (promise && promise.then) {
    promise.then(function () {
      assert.throwIfNotCalledAtLeastOnce()
    })
  } else {
    assert.throwIfNotCalledAtLeastOnce()
  }
}

test.NAME_REQUIRED_ERROR = 'Each test must have a name.'

module.exports = {
  test
}
