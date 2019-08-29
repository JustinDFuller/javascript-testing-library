import { AssertOptions } from './'

export class OptionsValidator {
  static readonly INVALID_OPTIONS_ERROR =
    'The only argument of t.equal should be an object.'

  static readonly NO_TYPE_EXPECTED_ERROR =
    'You cannot use a typeof as the expected argument of t.equal().'

  static readonly TYPES = [
    'string',
    'object',
    'number',
    'boolean',
    'symbol',
    'function',
    'bigint',
    'undefined'
  ]

  private readonly options: AssertOptions

  constructor (options: AssertOptions) {
    this.options = options
  }

  private isInvalid (): boolean {
    return typeof this.options !== 'object'
  }

  private throwInvalidError (): never {
    throw new Error(OptionsValidator.INVALID_OPTIONS_ERROR)
  }

  private usesTypeofAsExpected (): boolean {
    return OptionsValidator.TYPES.includes(this.options.expected)
  }

  private throwTypeofAsExpectedError (): never {
    throw new Error(OptionsValidator.NO_TYPE_EXPECTED_ERROR)
  }

  validate (): void | never {
    if (this.isInvalid()) {
      this.throwInvalidError()
    }

    if (this.usesTypeofAsExpected()) {
      this.throwTypeofAsExpectedError()
    }
  }
}
