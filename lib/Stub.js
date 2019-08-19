const fs = require('fs')

function isFunction (value) {
  return typeof value === 'function'
}

function throwUnstubbedDependencyError (module, key) {
  return function unstubbedDependency (...args) {
    const unstubbedDependencyError = new Error(
      `${Stub.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR} ${module}::${key}`
    )

    const last = args[args.length - 1]

    if (isFunction(last)) {
      return last(unstubbedDependencyError)
    }

    throw unstubbedDependencyError
  }
}

function isUnstubbedMethod (method) {
  return method.name !== throwUnstubbedDependencyError().name
}

function Stub () {
  const modulesBeforeTheyWereStubbed = new Map()

  function getUnstubbedModule (module) {
    return modulesBeforeTheyWereStubbed.get(module) || new Map()
  }

  function saveOriginalMethod ({ module, method }) {
    const unstubbedModule = getUnstubbedModule(module)
    const realMethod = require(module)[method]

    if (isUnstubbedMethod(realMethod)) {
      unstubbedModule.set(method, realMethod)
      modulesBeforeTheyWereStubbed.set(module, unstubbedModule)
    }
  }

  function updateRealModule ({ module, method, returns }) {
    require(module)[method] = returns
  }

  function resetStubs () {
    modulesBeforeTheyWereStubbed.forEach(function (methods, moduleName) {
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
      if (isFunction(fs[key])) {
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

    const originalFs = modulesBeforeTheyWereStubbed.get('fs')
    const mockedFs = new Map()

    if (originalFs) {
      Object.keys(fs).forEach(function (propertyName) {
        const property = fs[propertyName]

        if (isFunction(property)) {
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
    resetStubs,
    addStub
  }
}

Stub.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR =
  'You are attempting to access an un-stubbed dependency. Please use t.stub()'

Stub.INTERNAL_STUB_ERROR = 'You are attempting to stub an internal module.'

module.exports = {
  Stub
}
