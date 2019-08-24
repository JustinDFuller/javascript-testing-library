import fs from 'fs'
import { boundMethod } from 'autobind-decorator'

const ACCESSING_UNSTUBBED_DEPENDENCY_ERROR =
  'You are attempting to access an un-stubbed dependency. Please use t.stub()'

const INTERNAL_STUB_ERROR = 'You are attempting to stub an internal module.'

type ThirdPartyKey = string
type ThirdPartyProperty = any // eslint-disable-line @typescript-eslint/no-explicit-any

interface ThirdPartyModule {
  [propName: string]: ThirdPartyProperty
}

export interface StubOptions {
  module: string
  method: string
  returns: Function
}

function isFunction (value: ThirdPartyProperty): value is Function {
  return typeof value === 'function'
}

function forEachFunction (
  object: ThirdPartyModule,
  callback: (propertyName: ThirdPartyKey, property: Function) => void
): void {
  Object.keys(object).forEach(function (propertyName) {
    const property = object[propertyName]

    if (isFunction(property)) {
      callback(propertyName, property)
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

function isUnstubbedMethod (
  property: ThirdPartyProperty
): property is Function {
  return isFunction(property) && property.name !== 'unstubbedDependency'
}

function throwInternalModuleError (): never {
  throw new Error(INTERNAL_STUB_ERROR)
}

function isInternalModule (moduleName: string): boolean {
  return moduleName.includes('.')
}

type UnstubbedModule = Map<string, ThirdPartyProperty>
type UnstubbedModules = Map<string, UnstubbedModule>

interface UnstubbedModuleHandler {
  getModule(moduleName: string): UnstubbedModule
  forEach(
    callback: (unstubbedMethods: UnstubbedModule, moduleName: string) => void
  ): void
  saveMethod(moduleName: string, methodName: string, realMethod: Function): void
}

function UnstubbedModules (): UnstubbedModuleHandler {
  const modulesBeforeTheyWereStubbed: UnstubbedModules = new Map()

  function getModule (moduleName: string): UnstubbedModule {
    if (modulesBeforeTheyWereStubbed.has(moduleName)) {
      return modulesBeforeTheyWereStubbed.get(moduleName) as UnstubbedModule
    }

    const unstubbedModule: UnstubbedModule = new Map()
    modulesBeforeTheyWereStubbed.set(moduleName, unstubbedModule)
    return unstubbedModule
  }

  function forEach (
    callback: (unstubbedMethods: UnstubbedModule, moduleName: string) => void
  ): void {
    modulesBeforeTheyWereStubbed.forEach(callback)
  }

  function saveMethod (
    moduleName: string,
    methodName: string,
    realMethod: Function
  ): void {
    const unstubbedModule = getModule(moduleName)
    unstubbedModule.set(methodName, realMethod)
  }

  return {
    getModule,
    saveMethod,
    forEach
  }
}

class Module {
  private module: ThirdPartyModule

  constructor (moduleName: string) {
    this.module = require(moduleName)
  }

  setMethod (methodName: string, returns: Function): void {
    this.module[methodName] = returns
  }

  getMethod (methodName: string): ThirdPartyProperty {
    return this.module[methodName]
  }
}

export class Stub {
  static ACCESSING_UNSTUBBED_DEPENDENCY_ERROR = ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
  static INTERNAL_STUB_ERROR = INTERNAL_STUB_ERROR

  private readonly unstubbedModules: UnstubbedModuleHandler

  constructor () {
    this.unstubbedModules = UnstubbedModules()
  }

  private saveOriginalMethod (options: StubOptions): void {
    const realMethod = new Module(options.module).getMethod(options.method)

    if (isUnstubbedMethod(realMethod)) {
      this.unstubbedModules.saveMethod(
        options.module,
        options.method,
        realMethod
      )
    }
  }

  private updateRealModule (options: StubOptions): void {
    new Module(options.module).setMethod(options.method, options.returns)
  }

  private resetMethodsForModule (
    unstubbedMethods: UnstubbedModule,
    moduleName: string
  ): void {
    unstubbedMethods.forEach((returns: ThirdPartyProperty, method: string) => {
      if (isFunction(returns)) {
        this.updateRealModule({
          module: moduleName,
          method,
          returns
        })
      }
    })
  }

  private addWithoutResetting (options: StubOptions): void {
    this.saveOriginalMethod(options)
    this.updateRealModule(options)
  }

  init (): void {
    // just fs for now.
    forEachFunction(fs, (propertyName: string) => {
      this.addWithoutResetting({
        module: 'fs',
        method: propertyName,
        returns: throwUnstubbedDependencyError('fs', propertyName)
      })
    })
  }

  @boundMethod
  add (options: StubOptions): void {
    if (isInternalModule(options.module)) {
      throwInternalModuleError()
    }

    const stubbedMethods: Map<string, Function> = new Map()
    const unstubbedModule = this.unstubbedModules.getModule('fs')

    forEachFunction(fs, function (propertyName, property) {
      stubbedMethods.set(propertyName, property)
      const method = unstubbedModule.get(propertyName)

      if (isFunction(method)) {
        new Module('fs').setMethod(propertyName, method)
      }
    })

    this.addWithoutResetting(options)

    for (const [methodName, method] of stubbedMethods) {
      if (options.module !== 'fs' || methodName !== options.method) {
        new Module('fs').setMethod(methodName, method)
      }
    }
  }

  resetStubs (): void {
    this.unstubbedModules.forEach(this.resetMethodsForModule.bind(this))
  }
}
