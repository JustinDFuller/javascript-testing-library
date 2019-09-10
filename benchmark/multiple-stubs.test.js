const fs = require('fs')

const { Suite } = require('../dist/Suite')

const stubs = []

for (let propertyName in fs) {
  if (typeof fs[propertyName] === 'function') {
    stubs.push({
      module: 'fs',
      method: propertyName,
      returns (something, callback) {
        callback(null, ['value'])
      }
    })
  }
}

const suite = new Suite({
  name: 'Benchmark multiple-stubs',
  stubs
})

for (let i = 0; i <= 1000; i++) {
  suite.addTest({
    name: `test ${i}`,
    async test (t) {
      // have to call all stubs or an error is thrown
      stubs.forEach(stub => fs[stub.method](null, () => {}))

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
