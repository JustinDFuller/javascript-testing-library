import { SuiteFormatter } from '../Suite'
import { TestExitStrategy } from '../Test'

export interface SuitesFormatter extends SuiteFormatter {
  emitFile(filePath: string): void
  emitError(error: Error): void
  end(): void
}

export interface SuitesExitStrategy extends TestExitStrategy {
  end(): void
}

export interface SuiteRunner {
  execute(paths: string[]): Promise<void>
}

export interface SuitesOptions {
  exitStrategy: SuitesExitStrategy
  formatter: SuitesFormatter
}
