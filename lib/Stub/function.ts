// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFunction (value: any): value is Function {
  return typeof value === 'function'
}
