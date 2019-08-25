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

interface Returns extends Function {
  isStub?: boolean
}

export interface StubOptions {
  module: string
  method: string
  returns: Returns
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

class UnstubbedDependency {
  private readonly moduleName: string
  private readonly methodName: string

  constructor (moduleName: string, methodName: string) {
    this.moduleName = moduleName
    this.methodName = methodName
  }

  private getError (): Error {
    return new Error(
      `${ACCESSING_UNSTUBBED_DEPENDENCY_ERROR} ${this.moduleName}::${
        this.methodName
      }`
    )
  }

  @boundMethod
  throwUnstubbedError (...args: Function[]): never | void {
    const last = args[args.length - 1]

    if (isFunction(last)) {
      return last(this.getError())
    }

    throw this.getError()
  }
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

  private isInternalModule (): boolean {
    return this.moduleName.includes('.')
  }

  private validate (): void | never {
    if (this.isInternalModule()) {
      this.throwInternalModuleError()
    }
  }

  setMethod (methodName: string, returns: Function): void {
    this.module[methodName] = returns
  }

  getMethod (methodName: string): Function {
    return this.module[methodName]
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

  private isUnstubbedMethod (method: ThirdPartyProperty): method is Function {
    return isFunction(method) && method.name !== 'throwUnstubbedError'
  }

  private saveOriginalMethod (options: StubOptions): void {
    const realMethod = new Module(options.module).getMethod(options.method)

    if (this.isUnstubbedMethod(realMethod)) {
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

  @boundMethod
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

  init (): void {
    // just fs for now.
    forEachFunction(fs, (propertyName: string) => {
      this.add({
        module: 'fs',
        method: propertyName,
        returns: new UnstubbedDependency('fs', propertyName).throwUnstubbedError
      })
    })
  }

  @boundMethod
  add (options: StubOptions): void {
    this.saveOriginalMethod(options)
    this.updateRealModule(options)
  }

  resetStubs (): void {
    this.unstubbedModules.forEach(this.resetMethodsForModule)
  }
}
