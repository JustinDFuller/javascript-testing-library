import { boundMethod } from 'autobind-decorator'

const ACCESSING_UNSTUBBED_DEPENDENCY_ERROR =
  'You are attempting to access an un-stubbed dependency. Please use t.stub()'

const INTERNAL_STUB_ERROR = 'You are attempting to stub an internal module.'

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

  initializeAllMethods (): void {
    Object.keys(this.module).forEach(propertyName => {
      const property = this.getMethod(propertyName)

      if (isFunction(property)) {
        this.setMethod(
          propertyName,
          new UnstubbedDependency(this.moduleName, propertyName)
            .throwUnstubbedError
        )
      }
    })
  }
}

type UnstubbedModule = Map<string, ThirdPartyProperty>
type UnstubbedModules = Map<string, UnstubbedModule>

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

  private getModule (moduleName: string): UnstubbedModule {
    if (this.modulesBeforeTheyWereStubbed.has(moduleName)) {
      return this.modulesBeforeTheyWereStubbed.get(
        moduleName
      ) as UnstubbedModule
    }

    return this.createModule(moduleName)
  }

  reset (): void {
    this.modulesBeforeTheyWereStubbed.forEach(
      (unstubbedModule: UnstubbedModule, moduleName: string) => {
        unstubbedModule.forEach(
          (returns: ThirdPartyProperty, method: string) => {
            if (isFunction(returns)) {
              new Module(moduleName).setMethod(method, returns)
            }
          }
        )
      }
    )
  }

  saveMethod (
    moduleName: string,
    methodName: string,
    realMethod: Function
  ): void {
    const unstubbedModule = this.getModule(moduleName)
    unstubbedModule.set(methodName, realMethod)
  }
}

export class Stub {
  static ACCESSING_UNSTUBBED_DEPENDENCY_ERROR = ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
  static INTERNAL_STUB_ERROR = INTERNAL_STUB_ERROR

  private readonly modules: UnstubbedModuleHandler

  constructor () {
    this.modules = new UnstubbedModuleHandler()
  }

  private isUnstubbedMethod (method: ThirdPartyProperty): method is Function {
    return isFunction(method) && method.name !== 'throwUnstubbedError'
  }

  private saveOriginalMethod (options: StubOptions): void {
    const realMethod = new Module(options.module).getMethod(options.method)

    if (this.isUnstubbedMethod(realMethod)) {
      this.modules.saveMethod(options.module, options.method, realMethod)
    }
  }

  init (): void {
    new Module('fs').initializeAllMethods()
  }

  resetStubs (): void {
    this.modules.reset()
  }

  @boundMethod
  add (options: StubOptions): void {
    this.saveOriginalMethod(options)
    new Module(options.module).setMethod(options.method, options.returns)
  }
}
