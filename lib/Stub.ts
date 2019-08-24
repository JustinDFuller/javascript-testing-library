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

function isInternalModule (moduleName: string): boolean {
  return moduleName.includes('.')
}

class Module {
  private readonly moduleName: string
  private readonly module: ThirdPartyModule

  constructor (moduleName: string) {
    this.moduleName = moduleName
    this.validate()
    this.module = require(moduleName)
  }

  private throwInternalModuleError (): never {
    throw new Error(INTERNAL_STUB_ERROR)
  }

  private validate (): void | never {
    if (isInternalModule(this.moduleName)) {
      this.throwInternalModuleError()
    }
  }

  setMethod (methodName: string, returns: Function): void {
    this.module[methodName] = returns
  }

  getMethod (methodName: string): ThirdPartyProperty {
    return this.module[methodName]
  }

  getCurrentMethods (): Map<string, Function> {
    const currentMethods: Map<string, Function> = new Map()

    forEachFunction(this.module, (propertyName, property) => {
      currentMethods.set(propertyName, property)
    })

    return currentMethods
  }
}

type UnstubbedModule = Map<string, ThirdPartyProperty>
type UnstubbedModules = Map<string, UnstubbedModule>

interface UnstubbedModuleIterator {
  (unstubbedModule: UnstubbedModule, moduleName: string): void
}

class UnstubbedModuleHandler {
  private readonly modulesBeforeTheyWereStubbed: UnstubbedModules

  constructor () {
    this.modulesBeforeTheyWereStubbed = new Map()
  }

  private createModule (moduleName: string): UnstubbedModule {
    const unstubbedModule: UnstubbedModule = new Map()
    this.modulesBeforeTheyWereStubbed.set(moduleName, unstubbedModule)
    return unstubbedModule
  }

  getModule (moduleName: string): UnstubbedModule {
    if (this.modulesBeforeTheyWereStubbed.has(moduleName)) {
      return this.modulesBeforeTheyWereStubbed.get(
        moduleName
      ) as UnstubbedModule
    }

    return this.createModule(moduleName)
  }

  forEach (callback: UnstubbedModuleIterator): void {
    this.modulesBeforeTheyWereStubbed.forEach(callback)
  }

  saveMethod (
    moduleName: string,
    methodName: string,
    realMethod: Function
  ): void {
    const unstubbedModule = this.getModule(moduleName)
    unstubbedModule.set(methodName, realMethod)
  }

  restoreOriginalFunction (moduleName: string, propertyName: string): void {
    const unstubbedModule = this.getModule(moduleName)
    const method = unstubbedModule.get(propertyName)

    if (isFunction(method)) {
      new Module('fs').setMethod(propertyName, method)
    }
  }
}

export class Stub {
  static ACCESSING_UNSTUBBED_DEPENDENCY_ERROR = ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
  static INTERNAL_STUB_ERROR = INTERNAL_STUB_ERROR

  private readonly unstubbedModules: UnstubbedModuleHandler

  constructor () {
    this.unstubbedModules = new UnstubbedModuleHandler()
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
    unstubbedModule: UnstubbedModule,
    moduleName: string
  ): void {
    unstubbedModule.forEach((returns: ThirdPartyProperty, method: string) => {
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
    const moduleToStub = new Module(options.module)
    const currentMethods = moduleToStub.getCurrentMethods()

    forEachFunction(fs, propertyName => {
      this.unstubbedModules.restoreOriginalFunction('fs', propertyName)
    })

    this.addWithoutResetting(options)

    for (const [methodName, method] of currentMethods) {
      if (options.module !== 'fs' || options.method !== methodName) {
        new Module('fs').setMethod(methodName, method)
      }
    }
  }

  resetStubs (): void {
    this.unstubbedModules.forEach(this.resetMethodsForModule.bind(this))
  }
}
