const assert = require('./assert')

const test = require('./test')

assert.equal({
  expected: 'function',
  actual: typeof test
})

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

assert.equal({
  expected: 'Expected values to be strictly deep-equal:\n\n2 !== 1\n',
  actual: err.message
})
