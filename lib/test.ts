import { Assert, AssertOptions } from './Assert'
import { Stub, StubOptions } from './stub'

export interface TestActions {
  equal(options: AssertOptions): void;
  stub(options: StubOptions): void;
}

export interface TestOptions {
  readonly name: string;
  test(t: TestActions): void | Promise<void>;
}

export interface TestFormatter {
  emitTest(name: string): void;
  emitError(error: Error): void;
}

export function Test ({ name, test }: TestOptions, formatter: TestFormatter): void | Promise<void> {
  if (!name) {
    throw new Error(Test.NAME_REQUIRED_ERROR)
  }

  const assert = Assert()
  const stub = Stub()

  function handleComplete () {
    assert.throwIfNotCalledAtLeastOnce()
    stub.resetStubs()
  }

  function handleError (err: Error) {
    formatter.emitError(err)
  }

  stub.automaticallyStubModules()

  formatter.emitTest(name)

  try {
    const promise = test({
      equal: assert.equal,
      stub: stub.addStub
    })

    if (promise && promise.then) {
      return promise.then(handleComplete).catch(handleError)
    } else {
      handleComplete()
    }
  } catch (e) {
    formatter.emitError(e)
  }
}

Test.NAME_REQUIRED_ERROR = 'Each test must have a name.'

