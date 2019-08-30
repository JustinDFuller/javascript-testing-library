import { noop } from '../function'

export class ThrowExitStrategy {
  testError (error: Error): never {
    throw error
  }

  end = noop
}
