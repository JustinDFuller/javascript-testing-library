import { Suite, TestActions } from '../'

export const suite = new Suite({
  name: 'Assert throws'
})

class TestThrowsError extends Error {}

suite.addTest({
  name: 'provides a throws assertion',
  test (t: TestActions) {
    t.throws({
      expected: TestThrowsError,
      actual () {
        throw new TestThrowsError('Some message')
      }
    })
  }
})
