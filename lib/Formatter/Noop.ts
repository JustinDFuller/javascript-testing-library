import { noop } from '../function'
import { TestFormatter } from '../Test'
import { SuitesFormatter } from '../Suites'

export class NoopFormatter implements SuitesFormatter, TestFormatter {
  end = noop
  emitFile = noop
  emitTest = noop
  emitError = noop
  emitSuite (): NoopFormatter {
    return this
  }
}
