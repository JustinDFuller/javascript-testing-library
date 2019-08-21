const fs = require('fs')

export interface StubOptions {
  module: string;
  method: string;
  returns: Function;
}

interface ThirdPartyModule {
  [propName: string]: any;
}

function isFunction (value: any) {
  return typeof value === 'function'
}

function forEachFunction (object: ThirdPartyModule, callback: (propertyName: string, property: any) => void) {
  return Object.keys(object).forEach(function (propertyName) {
    if (isFunction(object[propertyName])) {
      callback(propertyName, object[propertyName])
    }
  })
}

function throwUnstubbedDependencyError (moduleName: string, key: string) {
  return function unstubbedDependency (...args: any[]) {
    const unstubbedDependencyError = new Error(
      `${Stub.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR} ${moduleName}::${key}`
    )

    const last = args[args.length - 1]

    if (isFunction(last)) {
      return last(unstubbedDependencyError)
    }

    throw unstubbedDependencyError
  }
}

function isUnstubbedMethod (method: Function) {
  return method.name !== 'unstubbedDependency'
}

function throwInternalModuleError () {
  throw new Error(Stub.INTERNAL_STUB_ERROR)
}

function isInternalModule (moduleName: string) {
  return moduleName.includes('.')
}

export function Stub () {
  const modulesBeforeTheyWereStubbed = new Map()

  function getUnstubbedModule (moduleName: string) {
    if (modulesBeforeTheyWereStubbed.has(moduleName)) {
      return modulesBeforeTheyWereStubbed.get(moduleName)
    }

    const unstubbedModule = new Map()
    modulesBeforeTheyWereStubbed.set(module, unstubbedModule)
    return unstubbedModule
  }

  function saveOriginalMethod ({ module, method }: StubOptions) {
    const realMethod = require(module)[method]

    if (isUnstubbedMethod(realMethod)) {
      const unstubbedModule = getUnstubbedModule(module)
      unstubbedModule.set(method, realMethod)
    }
  }

  function updateRealModule ({ module, method, returns }: StubOptions) {
    require(module)[method] = returns
  }

  function resetMethodsForModule (unstubbedMethods: Map<string, Function>, moduleName: string) {
    unstubbedMethods.forEach(function (originalMethod: Function, methodName: string) {
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

  function addStubWithoutResetting (options: StubOptions) {
    saveOriginalMethod(options)
    updateRealModule(options)
  }

  function addStub (options: StubOptions) {
    if (isInternalModule(options.module)) {
      throwInternalModuleError()
    }

    const stubbedMethods: Map<string, Function> = new Map()
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

