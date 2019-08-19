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

function throwInternalModuleError () {
  throw new Error(Stub.INTERNAL_STUB_ERROR)
}

function isInternalModule (module) {
  return module.includes('.')
}

function Stub () {
  const modulesBeforeTheyWereStubbed = new Map()

  function getUnstubbedModule (module) {
    if (!modulesBeforeTheyWereStubbed.has(module)) {
      const unstubbedModule = new Map()
      modulesBeforeTheyWereStubbed.set(module, unstubbedModule)
      return unstubbedModule
    }

    return modulesBeforeTheyWereStubbed.get(module)
  }

  function saveOriginalMethod ({ module, method }) {
    const unstubbedModule = getUnstubbedModule(module)
    const realMethod = require(module)[method]

    if (isUnstubbedMethod(realMethod)) {
      unstubbedModule.set(method, realMethod)
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

  function automaticallyStubModules () {
    // just fs for now.
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
    if (isInternalModule(options.module)) {
      throwInternalModuleError()
    }

    const unstubbedModule = modulesBeforeTheyWereStubbed.get('fs')
    const stubbedMethods = new Map()

    if (unstubbedModule) {
      Object.keys(fs).forEach(function (propertyName) {
        const property = fs[propertyName]

        if (isFunction(property)) {
          stubbedMethods.set(propertyName, property)
          fs[propertyName] =
            options.module !== 'fs' || unstubbedModule.get(propertyName)
        }
      })
    }

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
