import meow from 'meow'

import { globMatcher } from './glob'
import { requirer } from './requirer'
import { Suites } from './SuiteRunners/Suites'
import { SpinnerFormatter } from './Formatter/Spinner'
import { ProcessExitStrategy } from './ExitStrategy/Process'

export async function cli () {
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

  requirer(cli.flags.require)

  const formatter = new SpinnerFormatter()
  const exitStrategy = new ProcessExitStrategy()
  const suiteRunner = new Suites({ formatter, exitStrategy })

  const paths = await globMatcher(cli.input[0])

  await suiteRunner
    .execute(paths)
    .then(console.log)
    .catch(console.error)
}
