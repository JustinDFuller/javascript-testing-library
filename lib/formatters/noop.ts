import { TestFormatter } from '../Test'
import { SuitesFormatter } from '../Suites'

function noop (): void {} // eslint-disable-line @typescript-eslint/no-empty-function

export function NoopFormatter (): SuitesFormatter & TestFormatter {
  return {
    end: noop,
    emitFile: noop,
    emitError (err: Error): never {
      throw err
    },
    emitTest: noop,
    emitSuite (): SuitesFormatter & TestFormatter {
      return this
    }
  }
}
