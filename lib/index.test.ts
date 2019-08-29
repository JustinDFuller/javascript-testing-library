import { Suites } from './Suites'
import { SpinnerFormatter } from './formatters/spinner'

const formatter = SpinnerFormatter()

Suites({
  paths: [
    './Assert.test',
    './test.test',
    './Suite.test',
    './stub/index.test',
    './stub/UnstubbedDependency.test',
    './Suites.test'
  ],
  formatter
}).runAll()
