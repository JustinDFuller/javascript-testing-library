import meow from 'meow'

import { main } from './'
import { requirer } from './requirer'
import { Suites } from './SuiteRunners/Suites'
import { SpinnerFormatter } from './Formatter/Spinner'
import { ProcessExitStrategy } from './ExitStrategy/Process'

export function cli () {
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

  return main(cli.input[0], { suiteRunner })
    .then(console.log)
    .catch(console.error)
}
