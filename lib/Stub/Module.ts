import { isFunction } from '../function'

interface ThirdPartyModule {
  [propName: string]: Function
}

export class Module {
  static readonly INTERNAL_STUB_ERROR =
    'You are attempting to stub an internal module.'

  protected readonly moduleName: string
  protected readonly module: ThirdPartyModule
  private readonly cachedMethods: Map<string, Function>

  constructor (moduleName: string) {
    this.moduleName = moduleName
    this.validateModuleName()
    this.module = require(moduleName)
    this.cachedMethods = new Map()
  }

  private throwInternalModuleError (): never {
    throw new Error(Module.INTERNAL_STUB_ERROR)
  }

  private isInternalModule (): boolean {
    return this.moduleName.includes('.')
  }

  private validateModuleName (): void | never {
    if (this.isInternalModule()) {
      this.throwInternalModuleError()
    }
  }

  private isUnstubbedMethod (method: Function): method is Function {
    return isFunction(method) && method.name !== 'throwUnstubbedError'
  }

  protected saveOriginalMethod (methodName: string): Module {
    const originalMethod = this.getMethod(methodName)

    if (this.isUnstubbedMethod(originalMethod)) {
      this.cachedMethods.set(methodName, originalMethod)
    }

    return this
  }

  protected setMethod (methodName: string, returns: Function): Module {
    this.module[methodName] = returns

    return this
  }

  protected getMethod (methodName: string): Function {
    return this.module[methodName]
  }

  swapMethod (methodName: string, returns: Function): Module {
    this.saveOriginalMethod(methodName)
    this.setMethod(methodName, returns)

    return this
  }

  reset (): Module {
    this.cachedMethods.forEach(
      (returns: Function, methodName: string): void => {
        this.setMethod(methodName, returns)
      }
    )

    return this
  }
}
