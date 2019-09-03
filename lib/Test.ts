import { boundMethod } from 'autobind-decorator'

import { Stub, StubOptions } from './Stub'
import { Assert, AssertOptions } from './Assert'

export interface TestActions {
  equal(options: AssertOptions): void
  stub(options: StubOptions): void
}

export interface TestFormatter {
  emitTest(name: string): void
  emitError(error: Error): void
}

export interface TestExitStrategy {
  testError(error: Error): void
}

export interface TestOptions {
  readonly name: string
  readonly stubs?: StubOptions[]
  readonly formatter: TestFormatter
  readonly exitStrategy: TestExitStrategy
  test(t: TestActions): void | Promise<void>
}

export class Test {
  static readonly NAME_REQUIRED_ERROR = 'Each test must have a name.'

  private readonly stub: Stub
  private readonly assert: Assert
  private readonly options: TestOptions

  constructor (options: TestOptions) {
    this.options = options
    this.assert = new Assert()
    this.stub = new Stub()
    this.validateName()
  }

  @boundMethod
  private handleComplete (): void {
    this.stub.resetStubs()
    this.assert.throwIfNotCalledAtLeastOnce()
  }

  @boundMethod
  private handleError (err: Error): void {
    this.stub.resetStubs()
    this.options.formatter.emitError(err)
    this.options.exitStrategy.testError(err)
  }

  private validateName (): void | never {
    if (!this.options.name) {
      throw new Error(Test.NAME_REQUIRED_ERROR)
    }
  }

  private handleAsyncTest (promise: Promise<void>): Promise<void> {
    return promise.then(this.handleComplete).catch(this.handleError)
  }

  private isPromise (promise: void | Promise<void>): promise is Promise<void> {
    return Boolean(promise && promise.then)
  }

  private emitTest (): void {
    this.options.formatter.emitTest(this.options.name)
  }

  private initializeStubs (): void {
    if (this.options.stubs) {
      this.options.stubs.forEach(this.stub.add)
    }
  }

  execute (): void | Promise<void> {
    this.emitTest()
    this.stub.init()

    try {
      this.initializeStubs()

      const promise = this.options.test({
        equal: this.assert.equal,
        stub: this.stub.add
      })

      if (this.isPromise(promise)) {
        return this.handleAsyncTest(promise)
      } else {
        this.handleComplete()
      }
    } catch (e) {
      this.handleError(e)
    }
  }
}
