const fs = require('fs')

function unstubbedDependency () {
  throw new Error(Stub.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR)
}

function Stub () {
  const originalModules = new Map()

  function addStub ({ module, method, returns }) {
    const originalModule = originalModules.has(module)
      ? originalModules.get(module)
      : new Map()

    const realModule = require(module)
    const realMethod = realModule[method]
    originalModule.set(method, realMethod)
    realModule[method] = returns

    originalModules.set(module, originalModule)
  }

  return {
    initalizeUnstubbedDependencies () {
      Object.keys(fs).forEach(function (key) {
        if (typeof fs[key] === 'function') {
          addStub({
            module: 'fs',
            method: key,
            returns: unstubbedDependency
          })
        }
      })
    },
    resetStubs () {
      originalModules.forEach(function (methods, moduleName) {
        const realModule = require(moduleName)

        methods.forEach(function (originalMethod, methodName) {
          realModule[methodName] = originalMethod
        })
      })
    },
    addStub
  }
}

Stub.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR =
  'You are attempting to access an un-stubbed dependency. Please use t.stub()'

module.exports = {
  Stub
}
