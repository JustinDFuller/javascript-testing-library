import { noop } from '../function'
import { TestFormatter } from '../Test'
import { SuitesFormatter } from '../Suites'

export class NoopFormatter implements SuitesFormatter, TestFormatter {
  end = noop
  emitFile = noop
  emitTest = noop

  emitError (err: Error): never {
    throw err
  }

  emitSuite (): NoopFormatter {
    return this
  }
}
