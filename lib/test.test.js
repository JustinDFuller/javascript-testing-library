const test = require('./test')
const assert = require('./assert')

test({
  callback (t) {
    t.equal({
      expected: 'function',
      actual: typeof test
    })
  }
})

test({
  callback (t) {
    let err

    try {
      test({
        callback (t) {
          t.equal({
            expected: 1,
            actual: 2
          })
        }
      })
    } catch (e) {
      err = e
    }

    t.equal({
      expected: 'Expected values to be strictly deep-equal:\n\n2 !== 1\n',
      actual: err.message
    })
  }
})
