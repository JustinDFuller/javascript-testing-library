const fs = require('fs')

function isFunction (value) {
  return typeof value === 'function'
}

function forEachFunction (object, callback) {
  return Object.keys(object).forEach(function (propertyName) {
    if (isFunction(object[propertyName])) {
      callback(propertyName, object[propertyName])
    }
  })
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

function throwInternalModuleError () {
  throw new Error(Stub.INTERNAL_STUB_ERROR)
}

function isInternalModule (module) {
  return module.includes('.')
}

function Stub () {
  const modulesBeforeTheyWereStubbed = new Map()

  function getUnstubbedModule (module) {
    if (modulesBeforeTheyWereStubbed.has(module)) {
      return modulesBeforeTheyWereStubbed.get(module)
    }

    const unstubbedModule = new Map()
    modulesBeforeTheyWereStubbed.set(module, unstubbedModule)
    return unstubbedModule
  }

  function saveOriginalMethod ({ module, method }) {
    const realMethod = require(module)[method]

    if (isUnstubbedMethod(realMethod)) {
      const unstubbedModule = getUnstubbedModule(module)
      unstubbedModule.set(method, realMethod)
    }
  }

  function updateRealModule ({ module, method, returns }) {
    require(module)[method] = returns
  }

  function resetMethodsForModule (unstubbedMethods, moduleName) {
    unstubbedMethods.forEach(function (originalMethod, methodName) {
      updateRealModule({
        module: moduleName,
        method: methodName,
        returns: originalMethod
      })
    })
  }

  function resetStubs () {
    modulesBeforeTheyWereStubbed.forEach(resetMethodsForModule)
  }

  function automaticallyStubModules () {
    // just fs for now.
    forEachFunction(fs, function (propertyName) {
      addStubWithoutResetting({
        module: 'fs',
        method: propertyName,
        returns: throwUnstubbedDependencyError('fs', propertyName)
      })
    })
  }

  function addStubWithoutResetting (options) {
    saveOriginalMethod(options)
    updateRealModule(options)
  }

  function addStub (options) {
    if (isInternalModule(options.module)) {
      throwInternalModuleError()
    }

    const stubbedMethods = new Map()
    const unstubbedModule = modulesBeforeTheyWereStubbed.get('fs')

    forEachFunction(fs, function (propertyName, property) {
      stubbedMethods.set(propertyName, property)
      fs[propertyName] = unstubbedModule.get(propertyName)
    })

    addStubWithoutResetting(options)

    for (let [methodName, method] of stubbedMethods) {
      if (options.module !== 'fs' || methodName !== options.method) {
        fs[methodName] = method
      }
    }
  }

  return {
    automaticallyStubModules,
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
