import { globMatcher } from './glob'
import { Suites, SuitesFormatter, SuitesExitStrategy } from './Suites'

interface LibOptions {
  formatter: SuitesFormatter
  exitStrategy: SuitesExitStrategy
}

export async function main (
  globPattern: string,
  options: LibOptions
): Promise<void> {
  const { exitStrategy, formatter } = options

  const paths = await globMatcher(globPattern)

  await new Suites({
    paths,
    formatter,
    exitStrategy
  }).execute()
}

export { Suite } from './Suite'
export { TestActions } from './Test'
