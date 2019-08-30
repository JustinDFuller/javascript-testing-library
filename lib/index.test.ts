import { Suites } from './Suites'
import { SpinnerFormatter } from './formatters/spinner'

const formatter = new SpinnerFormatter()

new Suites({
  paths: [
    './Assert/index.test',
    './stub/index.test',
    './stub/UnstubbedDependency.test',
    './Test.test',
    './Suite.test',
    './Suites.test'
  ],
  formatter
}).runAll()
