import { Suites } from './Suites'
import { globMatcher } from './glob'
import { SpinnerFormatter } from './Formatter/Spinner'
import { ProcessExitStrategy } from './ExitStrategy/Process'

export async function main (globPattern: string): Promise<void> {
  const formatter = new SpinnerFormatter()
  const exitStrategy = new ProcessExitStrategy()

  const paths = await globMatcher(globPattern)
  await new Suites({
    paths,
    formatter,
    exitStrategy
  }).execute()
}

export { Suite } from './Suite'
export { TestActions } from './Test'
