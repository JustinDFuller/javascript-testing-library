const fs = require('fs')

const { Suite } = require('../dist/Suite')

const suite = new Suite({
  name: 'Benchmark no-stub'
})

for (let i = 0; i <= 1000; i++) {
  suite.addTest({
    name: `test ${i}`,
    test (t) {
      t.equal({
        actual: ['value'],
        expected: ['value']
      })
    }
  })
}

module.exports = {
  suite
}
