const fs = require('fs')

function throwUnstubbedDependencyError (module, key) {
  return function ubstubbedDependency (...args) {
    const unstubbedDependencyError = new Error(
      `${Stub.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR} ${module}::${key}`
    )

    const last = args[args.length - 1]

    if (typeof last === 'function') {
      return last(unstubbedDependencyError)
    }

    throw unstubbedDependencyError
  }
}

function StubStore () {
  const originalModules = new Map()

  function getOriginalModule (module) {
    return originalModules.get(module) || new Map()
  }

  function saveOriginalMethod ({ module, method }) {
    const originalModule = getOriginalModule(module)
    const realMethod = require(module)[method]

    if (realMethod.name !== 'ubstubbedDependency') {
      originalModule.set(method, realMethod)
      originalModules.set(module, originalModule)
    }
  }

  function updateRealModule ({ module, method, returns }) {
    require(module)[method] = returns
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

  function initializeUnstubbedDependencies () {
    Object.keys(fs).forEach(function (key) {
      if (typeof fs[key] === 'function') {
        addStubWithoutResetting({
          module: 'fs',
          method: key,
          returns: throwUnstubbedDependencyError('fs', key)
        })
      }
    })
  }

  function addStubWithoutResetting (options) {
    saveOriginalMethod(options)
    updateRealModule(options)
  }

  function addStub (options) {
    if (options.module.includes('.')) {
      throw new Error(Stub.INTERNAL_STUB_ERROR)
    }

    const originalFs = originalModules.get('fs')
    const mockedFs = new Map()

    if (originalFs) {
      Object.keys(fs).forEach(function (propertyName) {
        const property = fs[propertyName]

        if (typeof property === 'function') {
          mockedFs.set(propertyName, property)
          fs[propertyName] = originalFs.get(propertyName)
        }
      })
    }

    addStubWithoutResetting(options)

    for (let [methodName, method] of mockedFs) {
      if (methodName !== options.method) {
        fs[methodName] = method
      }
    }
  }

  return {
    initializeUnstubbedDependencies,
    saveOriginalMethod,
    updateRealModule,
    addStub,
    reset
  }
}

function Stub () {
  const store = StubStore()

  return {
    initializeUnstubbedDependencies: store.initializeUnstubbedDependencies,
    resetStubs: store.reset,
    addStub: store.addStub
  }
}

Stub.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR =
  'You are attempting to access an un-stubbed dependency. Please use t.stub()'

Stub.INTERNAL_STUB_ERROR = 'You are attempting to stub an internal module.'

module.exports = {
  Stub
}
