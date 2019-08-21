import { TestFormatter } from '../Test'
import { SuitesFormatter } from '../Suites'

export function NoopFormatter (): SuitesFormatter & TestFormatter {
  return {
    end() {},
    emitFile () {},
    emitError (err: Error): never {
      throw err
    },
    emitTest () {},
    emitSuite () {
      return this
    }
  }
}

