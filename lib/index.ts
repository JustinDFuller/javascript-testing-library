import { globMatcher } from './glob'
import { SuiteRunner } from './SuiteRunners'

interface LibOptions {
  suiteRunner: SuiteRunner
}

export async function main (
  globPattern: string,
  options: LibOptions
): Promise<void> {
  const paths = await globMatcher(globPattern)

  await options.suiteRunner.execute(paths)
}

export { Suite } from './Suite'
export { TestActions } from './Test'
