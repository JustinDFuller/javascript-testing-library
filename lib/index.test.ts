import { Suites } from './Suites'
import { SpinnerFormatter } from './formatters/spinner'

const formatter = new SpinnerFormatter()

new Suites({
  paths: [
    './Assert/index.test',
    './test.test',
    './Suite.test',
    './stub/index.test',
    './stub/UnstubbedDependency.test',
    './Suites.test'
  ],
  formatter
}).runAll()
