import { Suites } from './Suites'
import { SpinnerFormatter } from './Formatter/Spinner'
import { ProcessExitStrategy } from './ExitStrategy/Process'

const formatter = new SpinnerFormatter()
const exitStrategy = new ProcessExitStrategy()

new Suites({
  paths: [
    './Assert/index.test',
    './stub/index.test',
    './stub/UnstubbedDependency.test',
    './Test.test',
    './Suite.test',
    './Suites.test'
  ],
  formatter,
  exitStrategy
}).runAll()
