import { SuitesFormatter } from '../Suites'

export function NoopFormatter (): SuitesFormatter {
  return {
    emitError (err) {
      throw err
    },
    emitTest (testName) {},
    emitFile () {},
    emitSuite (suiteName) {
      return this
    }
  }
}

