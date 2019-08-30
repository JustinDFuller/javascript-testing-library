export class ProcessExitStrategy {
  testError (): void {
    process.exit(1)
  }

  end (): void {
    process.exit(0)
  }
}
