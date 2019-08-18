const { Suites } = require('./Suites')

Suites({
  paths: [
    './Assert.test',
    './test.test',
    './Suite.test',
    './stub.test',
    './Suites.test'
  ]
}).runAll()
