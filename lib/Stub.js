const fs = require('fs')

function throwUnstubbedDependencyError (module, key) {
  return function () {
    throw new Error(
      `${Stub.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR} ${module}::${key}`
    )
  }
}

function StubStore () {
  const originalModules = new Map()

  function getOriginalModule (module) {
    return originalModules.get(module) || new Map()
  }

  function saveOriginalMethod ({ module, method }) {
    const originalModule = getOriginalModule(module)
    const realModule = require(module)
    const realMethod = realModule[method]
    originalModule.set(method, realMethod)
    originalModules.set(module, originalModule)
  }

  function updateRealModule ({ module, method, returns }) {
    const realModule = require(module)
    realModule[method] = returns
  }

  function reset () {
    originalModules.forEach(function (methods, moduleName) {
      methods.forEach(function (originalMethod, methodName) {
        updateRealModule({
          module: moduleName,
          method: methodName,
          returns: originalMethod
        })
      })
    })
  }

  return {
    saveOriginalMethod,
    updateRealModule,
    reset
  }
}

function Stub () {
  const store = StubStore()

  function addStub (options) {
    store.saveOriginalMethod(options)
    store.updateRealModule(options)
  }

  return {
    initializeUnstubbedDependencies () {
      Object.keys(fs).forEach(function (key) {
        if (typeof fs[key] === 'function') {
          addStub({
            module: 'fs',
            method: key,
            returns: throwUnstubbedDependencyError('fs', key)
          })
        }
      })
    },
    resetStubs: store.reset,
    addStub
  }
}

Stub.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR =
  'You are attempting to access an un-stubbed dependency. Please use t.stub()'

Stub.INTERNAL_STUB_ERROR = 'You are attempting to stub an internal module.'

module.exports = {
  Stub
}
