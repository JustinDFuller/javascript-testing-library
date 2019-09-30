import { boundMethod } from 'autobind-decorator'

import { Stub, StubOptions } from './Stub'
import { Assert, AssertOptions, ThrowsOptions } from './Assert'

export interface TestActions {
  equal(options: AssertOptions): void
  throws(options: ThrowsOptions): void
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

class NameRequiredError extends Error {
  readonly message = 'Each test must have a name.'
}

export class Test {
  static readonly NAME_REQUIRED_ERROR = NameRequiredError

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
    this.stub.resetStubs(true)
    this.assert.throwIfNotCalledAtLeastOnce()
  }

  @boundMethod
  private handleError (err: Error): void {
    this.stub.resetStubs(false)
    this.options.formatter.emitError(err)
    this.options.exitStrategy.testError(err)
  }

  private validateName (): void | never {
    if (!this.options.name) {
      throw new Test.NAME_REQUIRED_ERROR()
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
    this.stub.automaticallyStubExpensiveIO()
  }

  execute (): void | Promise<void> {
    this.emitTest()
    this.initializeStubs()

    try {
      const promise = this.options.test({
        equal: this.assert.equal,
        throws: this.assert.throws
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
