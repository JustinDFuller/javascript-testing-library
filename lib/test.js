const { Assert } = require('./Assert')
const { Stub } = require('./stub')

function Test ({ name, test }, formatter) {
  if (!name) {
    throw new Error(Test.NAME_REQUIRED_ERROR)
  }

  const assert = Assert()
  const stub = Stub()

  function handleComplete () {
    assert.throwIfNotCalledAtLeastOnce()
    stub.resetStubs()
  }

  function handleError (err) {
    formatter.emitError(err)
  }

  stub.automaticallyStubModules()

  formatter.emitTest(name)

  try {
    const promise = test({
      equal: assert.equal,
      stub: stub.addStub
    })

    if (promise && promise.then) {
      return promise.then(handleComplete).catch(handleError)
    } else {
      handleComplete()
    }
  } catch (e) {
    formatter.emitError(e)
  }
}

Test.NAME_REQUIRED_ERROR = 'Each test must have a name.'

module.exports = {
  Test
}
