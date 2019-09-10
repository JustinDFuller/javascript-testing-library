const fs = require('fs')

const { Suite } = require('../dist/Suite')

const suite = new Suite({
  name: 'Benchmark async'
})

for (let i = 0; i <= 1000; i++) {
  suite.addTest({
    name: `test ${i}`,
    stubs: [
      {
        module: 'fs',
        method: 'readdir',
        returns (dir, callback) {
          return callback(null, ['value'])
        }
      }
    ],
    async test (t) {
      const actual = await new Promise(function (resolve) {
        fs.readdir('something', function (err, res) {
          resolve(res)
        })
      })

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
