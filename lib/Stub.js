const fs = require('fs')

function throwUnstubbedDependencyError () {
  throw new Error(Stub.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR)
}

function StubStore () {
  const originalModules = new Map()
  const realModules = new Map()

  function getOriginalModule (module) {
    return originalModules.get(module) || new Map()
  }

  function initRealModule (module) {
    const required = require(module)
    realModules.set(module, required)
    return required
  }

  function getRealModule (module) {
    return realModules.get(module) || initRealModule(module)
  }

  function saveOriginalMethod ({ module, method }) {
    const originalModule = getOriginalModule(module)
    const realModule = getRealModule(module)
    const realMethod = realModule[method]
    originalModule.set(method, realMethod)
    originalModules.set(module, originalModule)
  }

  function updateRealModule ({ module, method, returns }) {
    const realModule = getRealModule(module)
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
    initalizeUnstubbedDependencies () {
      Object.keys(fs).forEach(function (key) {
        if (typeof fs[key] === 'function') {
          addStub({
            module: 'fs',
            method: key,
            returns: throwUnstubbedDependencyError
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

module.exports = {
  Stub
}
