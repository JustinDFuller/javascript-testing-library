import glob from 'glob'
import path from 'path'
import { promisify } from 'util'

const globAsync = promisify(glob)

export async function globMatcher (globPattern: string): Promise<string[]> {
  const paths = await globAsync(globPattern)
  return paths.map(p => path.resolve(process.cwd(), p))
}
