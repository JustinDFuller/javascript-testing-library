import { boundMethod } from 'autobind-decorator'

interface ThirdPartyModule {
  [propName: string]: Function
}

interface StubbedMethodOptions {
  stub: Function
  moduleName: string
  methodName: string
}

export class StubNotUsedError extends Error {
  constructor (moduleName: string, methodName: string) {
    super(
      `Expected stub to be called at least once. ${moduleName}.${methodName}`
    )
  }
}

export class StubbedTwiceError extends Error {
  constructor (moduleName: string, methodName: string) {
    super(`Expected stub to only be created once. ${moduleName}.${methodName}`)
  }
}

class StubbedMethod {
  private called = false
  private readonly stub: Function
  private readonly moduleName: string
  private readonly methodName: string

  constructor (options: StubbedMethodOptions) {
    this.stub = options.stub
    this.moduleName = options.moduleName
    this.methodName = options.methodName
  }

  @boundMethod
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute (...args: any[]): any {
    this.called = true
    return this.stub(...args)
  }

  @boundMethod
  ensureCalled (): void | never {
    if (this.called === false) {
      throw new StubNotUsedError(this.moduleName, this.methodName)
    }
  }
}

export class Module {
  static readonly INTERNAL_STUB_ERROR =
    'You are attempting to stub an internal module.'

  protected readonly moduleName: string
  protected readonly module: ThirdPartyModule
  private readonly cachedMethods: Map<string, Function>
  private readonly stubbedMethods: Map<string, StubbedMethod>

  constructor (moduleName: string) {
    this.moduleName = moduleName
    this.validateModuleName()
    this.module = require(moduleName)
    this.cachedMethods = new Map()
    this.stubbedMethods = new Map()
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

  private ensureStubsCalled (): never | void {
    this.stubbedMethods.forEach(
      (stub: StubbedMethod): never | void => {
        stub.ensureCalled()
      }
    )
  }

  protected saveOriginalMethod (methodName: string): Module {
    const originalMethod = this.getMethod(methodName)

    if (!this.cachedMethods.has(methodName)) {
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

  protected resetCachedMethods (): void {
    this.cachedMethods.forEach(
      (returns: Function, methodName: string): void => {
        this.setMethod(methodName, returns)
      }
    )
  }

  swapMethod (methodName: string, returns: Function): Module {
    this.saveOriginalMethod(methodName)

    const stub = new StubbedMethod({
      stub: returns,
      methodName,
      moduleName: this.moduleName
    })

    if (this.stubbedMethods.has(methodName)) {
      throw new StubbedTwiceError(this.moduleName, methodName)
    } else {
      this.stubbedMethods.set(methodName, stub)
    }

    this.setMethod(methodName, stub.execute)

    return this
  }

  reset (): Module {
    this.ensureStubsCalled()
    this.resetCachedMethods()

    return this
  }
}
