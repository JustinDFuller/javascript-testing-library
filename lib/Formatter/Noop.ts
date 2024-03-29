import { noop } from '../function'
import { TestFormatter } from '../Test'
import { SuitesFormatter } from '../SuiteRunners'

export class NoopFormatter implements SuitesFormatter, TestFormatter {
  end = noop
  emitFile = noop
  emitTest = noop
  emitError = noop
  emitSuite = noop
}
