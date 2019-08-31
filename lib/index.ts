import { Suites } from './Suites'
import { globMatcher } from './glob'
import { SpinnerFormatter } from './Formatter/Spinner'
import { ProcessExitStrategy } from './ExitStrategy/Process'

const formatter = new SpinnerFormatter()
const exitStrategy = new ProcessExitStrategy()

export async function main (globPattern: string): Promise<void> {
  const paths = await globMatcher(globPattern)
  await new Suites({
    paths,
    formatter,
    exitStrategy
  }).runAll()
}
