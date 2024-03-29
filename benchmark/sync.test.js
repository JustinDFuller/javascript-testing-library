const fs = require('fs')

const { Suite } = require('../dist/Suite')

const suite = new Suite({
  name: 'Benchmark sync'
})

for (let i = 0; i <= 1000; i++) {
  suite.addTest({
    name: `test ${i}`,
    stubs: [
      {
        module: 'fs',
        method: 'readdirSync',
        returns (dir) {
          return ['value']
        }
      }
    ],
    test (t) {
      const actual = fs.readdirSync('somedir')

      t.equal({
        actual,
        expected: ['value']
      })
    }
  })
}

module.exports = {
  suite
}
