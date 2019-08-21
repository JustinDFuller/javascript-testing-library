import fs from 'fs'

type ThirdPartyKey = string
type ThirdPartyProperty = object | number | boolean | string | Function

interface ThirdPartyModule {
  [propName: string]: ThirdPartyProperty
}

export interface StubOptions {
  module: string
  method: string
  returns: Function
}

interface Stub {
  resetStubs(): void
  addStub(options: StubOptions): void
  automaticallyStubModules(): void
}

const ACCESSING_UNSTUBBED_DEPENDENCY_ERROR =
  'You are attempting to access an un-stubbed dependency. Please use t.stub()'

const INTERNAL_STUB_ERROR = 'You are attempting to stub an internal module.'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFunction (value: ThirdPartyProperty): value is Function {
  return typeof value === 'function'
}

function forEachFunction (
  object: ThirdPartyModule,
  callback: (propertyName: ThirdPartyKey, property: Function) => void
): void {
  Object.keys(object).forEach(function (propertyName) {
    if (isFunction(object[propertyName])) {
      callback(propertyName, object[propertyName] as Function)
    }
  })
}

function throwUnstubbedDependencyError (moduleName: string, key: string) {
  return function unstubbedDependency (...args: Function[]): never | void {
    const unstubbedDependencyError = new Error(
      `${ACCESSING_UNSTUBBED_DEPENDENCY_ERROR} ${moduleName}::${key}`
    )

    const last = args[args.length - 1]

    if (isFunction(last)) {
      return last(unstubbedDependencyError)
    }

    throw unstubbedDependencyError
  }
}

function isUnstubbedMethod (method: Function): boolean {
  return method.name !== 'unstubbedDependency'
}

function throwInternalModuleError (): never {
  throw new Error(INTERNAL_STUB_ERROR)
}

function isInternalModule (moduleName: string): boolean {
  return moduleName.includes('.')
}

type UnstubbedModule = Map<string, ThirdPartyModule>
type UnstubbedModules = Map<string, UnstubbedModule>

export function Stub (): Stub {
  const modulesBeforeTheyWereStubbed: UnstubbedModules = new Map()

  function getUnstubbedModule (moduleName: string): UnstubbedModule {
    if (modulesBeforeTheyWereStubbed.has(moduleName)) {
      return modulesBeforeTheyWereStubbed.get(moduleName) as UnstubbedModule
    }

    const unstubbedModule = new Map()
    modulesBeforeTheyWereStubbed.set(moduleName, unstubbedModule)
    return unstubbedModule
  }

  function saveOriginalMethod (options: StubOptions): void {
    const realMethod = require(options.module)[options.method]

    if (isUnstubbedMethod(realMethod)) {
      const unstubbedModule = getUnstubbedModule(options.module)
      unstubbedModule.set(options.method, realMethod)
    }
  }

  function updateRealModule (options: StubOptions): void {
    require(options.module)[options.method] = options.returns
  }

  function resetMethodsForModule (
    unstubbedMethods: UnstubbedModule,
    moduleName: string
  ): void {
    unstubbedMethods.forEach(function (
      originalMethod: ThirdPartyModule,
      methodName: string
    ) {
      if (isFunction(originalMethod)) {
        updateRealModule({
          module: moduleName,
          method: methodName,
          returns: originalMethod
        })
      }
    })
  }

  function resetStubs (): void {
    modulesBeforeTheyWereStubbed.forEach(resetMethodsForModule)
  }

  function addStubWithoutResetting (options: StubOptions): void {
    saveOriginalMethod(options)
    updateRealModule(options)
  }

  function automaticallyStubModules (): void {
    // just fs for now.
    forEachFunction(fs, function (propertyName) {
      addStubWithoutResetting({
        module: 'fs',
        method: propertyName,
        returns: throwUnstubbedDependencyError('fs', propertyName)
      })
    })
  }

  function addStub (options: StubOptions): void {
    if (isInternalModule(options.module)) {
      throwInternalModuleError()
    }

    const stubbedMethods: Map<string, Function> = new Map()
    const unstubbedModule = modulesBeforeTheyWereStubbed.get('fs')

    forEachFunction(fs, function (propertyName, property) {
      stubbedMethods.set(propertyName, property)

      if (unstubbedModule && unstubbedModule.has(propertyName)) {
        require('fs')[propertyName] = unstubbedModule.get(propertyName)
      }
    })

    addStubWithoutResetting(options)

    for (const [methodName, method] of stubbedMethods) {
      if (options.module !== 'fs' || methodName !== options.method) {
        require('fs')[methodName] = method
      }
    }
  }

  return {
    automaticallyStubModules,
    resetStubs,
    addStub
  }
}

Stub.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR = ACCESSING_UNSTUBBED_DEPENDENCY_ERROR

Stub.INTERNAL_STUB_ERROR = INTERNAL_STUB_ERROR
