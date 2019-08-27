import { boundMethod } from 'autobind-decorator'

import { isFunction } from './function'

const ACCESSING_UNSTUBBED_DEPENDENCY_ERROR =
  'You are attempting to access an un-stubbed dependency. Please use t.stub()'

export class UnstubbedDependency {
  static readonly ACCESSING_UNSTUBBED_DEPENDENCY_ERROR = ACCESSING_UNSTUBBED_DEPENDENCY_ERROR

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
