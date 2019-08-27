import { isFunction } from './function'
import { UnstubbedDependency } from './UnstubbedDependency'

type ThirdPartyProperty = any // eslint-disable-line @typescript-eslint/no-explicit-any

interface ThirdPartyModule {
  [propName: string]: ThirdPartyProperty
}

const INTERNAL_STUB_ERROR = 'You are attempting to stub an internal module.'

export class Module {
  static readonly INTERNAL_STUB_ERROR = INTERNAL_STUB_ERROR

  private readonly moduleName: string
  private readonly module: ThirdPartyModule
  private readonly cachedMethods: Map<string, Function>

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
