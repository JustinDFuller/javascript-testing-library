import { boundMethod } from 'autobind-decorator'

import { Module } from './Module'

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

export class UserStubbedModule extends Module {
  private readonly stubbedMethods: Map<string, StubbedMethod>

  constructor (moduleName: string) {
    super(moduleName)
    this.stubbedMethods = new Map()
  }

  protected setMethod (methodName: string, returns: Function): Module {
    const stub = new StubbedMethod({
      stub: returns,
      methodName,
      moduleName: this.moduleName
    })
    this.stubbedMethods.set(methodName, stub)
    this.module[methodName] = stub.execute

    return this
  }

  private ensureStubsCalled (): never | void {
    this.stubbedMethods.forEach(
      (stub: StubbedMethod): never | void => {
        stub.ensureCalled()
      }
    )
  }

  reset (): Module {
    this.ensureStubsCalled()
    this.resetCachedMethods()

    return this
  }
}
