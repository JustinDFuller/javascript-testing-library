const { Assert } = require('./Assert')
const { stub } = require('./stub')

function Test ({ name, test }) {
  if (!name) {
    throw new Error(Test.NAME_REQUIRED_ERROR)
  }

  const assert = Assert()
  console.log(`  ${name}`)
  const promise = test({
    equal: assert.equal,
    stub
  })

  if (promise && promise.then) {
    promise
      .then(function () {
        assert.throwIfNotCalledAtLeastOnce()
      })
      .catch(function (err) {
        console.error(err)
        process.exit(1)
      })
  } else {
    assert.throwIfNotCalledAtLeastOnce()
  }
}

Test.NAME_REQUIRED_ERROR = 'Each test must have a name.'

module.exports = {
  Test
}
