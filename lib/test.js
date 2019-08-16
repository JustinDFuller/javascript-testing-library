const { Assert } = require('./Assert')

function Test ({ name, test }) {
  if (!name) {
    throw new Error(Test.NAME_REQUIRED_ERROR)
  }

  const assert = Assert()
  console.log(`  ${name}`)
  const promise = test(assert)

  if (promise && promise.then) {
    promise.then(function () {
      assert.throwIfNotCalledAtLeastOnce()
    })
  } else {
    assert.throwIfNotCalledAtLeastOnce()
  }
}

Test.NAME_REQUIRED_ERROR = 'Each test must have a name.'

module.exports = {
  Test
}
