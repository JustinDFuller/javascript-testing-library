const fs = require('fs')

const { Suite } = require('../dist/Suite')

const suite = new Suite({
  name: 'Benchmark multiple-stubs'
})

for (let i = 0; i <= 1000; i++) {
  suite.addTest({
    name: `test ${i}`,
    async test (t) {
      for (let propertyName in fs) {
        if (typeof fs[propertyName] === 'function') {
          t.stub({
            module: 'fs',
            method: propertyName,
            returns (something, callback) {
              callback(null, ['value'])
            }
          })
        }
      }

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
