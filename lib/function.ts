export function isFunction (value: Function): value is Function {
  return typeof value === 'function'
}

export function noop (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
