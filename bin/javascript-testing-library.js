#!/usr/bin/env node

const meow = require('meow')

const { main } = require('../dist')
const { requirer } = require('../dist/requirer')
const { Suites } = require('../dist/SuiteRunners/Suites')
const { SpinnerFormatter } = require('../dist/Formatter/Spinner')
const { ProcessExitStrategy } = require('../dist/ExitStrategy/Process')

const cli = meow(
  `
  Usage
    $ javascript-testing-library <input>

  Options
    --require, -r path  The paths to require (ex. ts-node/register)

  Examples
    $ javascript-testing-library lib/**/*.test.ts
`,
  {
    flags: {
      require: {
        type: 'string',
        alias: 'r'
      }
    }
  }
)

const formatter = new SpinnerFormatter()
const exitStrategy = new ProcessExitStrategy()
const suiteRunner = new Suites({ formatter, exitStrategy })

requirer(cli.flags.require)

main(cli.input[0], { formatter, exitStrategy, suiteRunner })
  .then(console.log)
  .catch(console.error)
