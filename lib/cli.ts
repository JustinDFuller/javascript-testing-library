import meow from 'meow'

import { globMatcher } from './glob'
import { requirer } from './requirer'
import { WatchRunner } from './SuiteRunners/WatchRunner'
import { SingleRunner } from './SuiteRunners/SingleRunner'
import { SpinnerFormatter } from './Formatter/Spinner'
import { ProcessExitStrategy } from './ExitStrategy/Process'
import { ThrowExitStrategy } from './ExitStrategy/Throw'

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
        },
        watch: {
          type: 'boolean',
          alias: 'w'
        }
      }
    }
  )

  requirer(cli.flags.require)

  const formatter = new SpinnerFormatter()

  let suiteRunner

  if (cli.flags.watch) {
    const exitStrategy = new ThrowExitStrategy()
    suiteRunner = new WatchRunner({ formatter, exitStrategy })
  } else {
    const exitStrategy = new ProcessExitStrategy()
    suiteRunner = new SingleRunner({ formatter, exitStrategy })
  }

  const paths = await globMatcher(cli.input[0])

  await suiteRunner
    .execute(paths)
    .then(console.log)
    .catch(console.error)
}
