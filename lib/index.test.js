const { Suites } = require('./Suites')
const { ConsoleFormatter } = require('./formatters/console')

Suites({
  paths: [
    './Assert.test',
    './test.test',
    './Suite.test',
    './stub.test',
    './Suites.test'
  ],
  formatter: ConsoleFormatter()
}).runAll()
