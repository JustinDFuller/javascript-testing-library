const assert = require('./assert')

module.exports = function test ({ name, callback }) {
  if (!name) {
    throw new Error(`Each test must have a name. Received "${name}".`)
  }

  console.log(name)
  callback(assert)
}
