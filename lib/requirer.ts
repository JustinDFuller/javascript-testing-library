import _ from 'lodash'

export function requirer (paths: string | string[]) {
  _.castArray(paths).forEach((path: string) => require(path))
}
