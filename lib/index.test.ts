const { Suites } = require('./Suites')
const { SpinnerFormatter } = require('./formatters/spinner')

const formatter = SpinnerFormatter()

Suites({
  paths: [
    './Assert.test',
    './test.test',
    './Suite.test',
    './stub.test',
    './Suites.test'
  ],
  formatter
}).runAll()
