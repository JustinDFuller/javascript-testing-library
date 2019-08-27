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
  private readonly cachedMethods: Map<string, Returns>

  constructor (moduleName: string) {
    this.moduleName = moduleName
    this.validate()
    this.module = require(moduleName)
    this.cachedMethods = new Map()
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

  private isUnstubbedMethod (method: ThirdPartyProperty): method is Function {
    return isFunction(method) && method.name !== 'throwUnstubbedError'
  }

  private setMethod (methodName: string, returns: Function): Module {
    this.module[methodName] = returns
    return this
  }

  private getMethod (methodName: string): Function {
    return this.module[methodName]
  }

  private saveOriginalMethod (methodName: string): Module {
    const realMethod = this.getMethod(methodName)

    if (this.isUnstubbedMethod(realMethod)) {
      this.cachedMethods.set(methodName, realMethod)
    }

    return this
  }

  initializeAllMethods (): Module {
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

    return this
  }

  swapMethod (methodName: string, returns: Returns): Module {
    this.saveOriginalMethod(methodName)
    this.setMethod(methodName, returns)

    return this
  }

  reset (): Module {
    this.cachedMethods.forEach(
      (returns: Returns, methodName: string): void => {
        this.setMethod(methodName, returns)
      }
    )

    return this
  }
}

export class Stub {
  static ACCESSING_UNSTUBBED_DEPENDENCY_ERROR = ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
  static INTERNAL_STUB_ERROR = INTERNAL_STUB_ERROR

  private readonly stubbedModules: Map<string, Module>

  constructor () {
    this.stubbedModules = new Map()
  }

  private getModule (moduleName: string): Module {
    const mod = this.stubbedModules.get(moduleName)

    if (mod) {
      return mod
    }

    this.stubbedModules.set(moduleName, new Module(moduleName))
    return this.getModule(moduleName)
  }

  init (): void {
    this.getModule('fs').initializeAllMethods()
  }

  resetStubs (): void {
    this.stubbedModules.forEach(mod => mod.reset())
  }

  @boundMethod
  add (options: StubOptions): void {
    this.getModule(options.module).swapMethod(options.method, options.returns)
  }
}
