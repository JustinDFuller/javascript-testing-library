const fs = require('fs')

const { Suite } = require('./Suite')

const suite = Suite({
  name: 'Stub'
})

suite.addTest({
  name: 'allows you to mock the response of an external module',
  async test (t) {
    t.stub({
      module: 'fs',
      method: 'readFile',
      returns (file, options, callback) {
        return callback(null, `You are trying to read ${file}`)
      }
    })

    const actual = await new Promise(function (resolve, reject) {
      fs.readFile('filename.jpg', 'utf8', function (err, res) {
        if (err) return reject(err)
        resolve(res)
      })
    })

    t.equal({
      expected: 'You are trying to read filename.jpg',
      actual
    })
  }
})

module.exports = {
  suite
}
