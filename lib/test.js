const { Assert } = require('./Assert')
const { Stub } = require('./stub')

function Test ({ name, test }) {
  if (!name) {
    throw new Error(Test.NAME_REQUIRED_ERROR)
  }

  const assert = Assert()
  const stub = Stub()

  stub.initalizeUnstubbedDependencies()

  console.log(`  ${name}`)
  const promise = test({
    equal: assert.equal,
    stub: stub.addStub
  })

  if (promise && promise.then) {
    promise
      .then(function () {
        assert.throwIfNotCalledAtLeastOnce()
        stub.resetStubs()
      })
      .catch(function (err) {
        console.error(err)
        process.exit(1)
      })
  } else {
    assert.throwIfNotCalledAtLeastOnce()
    stub.resetStubs()
  }
}

Test.NAME_REQUIRED_ERROR = 'Each test must have a name.'

module.exports = {
  Test
}
