import { Module } from './Module'

import { isFunction } from '../function'
import { UnstubbedDependency } from './UnstubbedDependency'

interface ExclusionMap {
  [key: string]: string[]
}

class Exclusions {
  private readonly exclusions: ExclusionMap

  constructor () {
    this.exclusions = {
      fs: ['realpathSync' /* this is used by require() */, 'ReadStream'],
      net: ['Socket'], // currently don't understand why this exclusion is needed
      process: ['kill', '_kill', '_fatalException', 'emit']
    }
  }

  has (moduleName: string, propertyName: string): boolean {
    return (this.exclusions[moduleName] || []).includes(propertyName)
  }
}

export class UnstubbedModule extends Module {
  private readonly exclusions: Exclusions

  constructor (moduleName: string) {
    super(moduleName)
    this.exclusions = new Exclusions()
    this.initializeAllMethods()
  }

  initializeAllMethods (): Module {
    for (const propertyName in this.module) {
      if (!this.exclusions.has(this.moduleName, propertyName)) {
        const property = this.getMethod(propertyName)

        if (isFunction(property)) {
          this.saveOriginalMethod(propertyName)
          this.setMethod(
            propertyName,
            new UnstubbedDependency(this.moduleName, propertyName)
              .throwUnstubbedError
          )
        }
      }
    }

    return this
  }

  /**
   * Overriding swapMethod here because the original method is already saved.
   * If you were to save the original method again then it would be overwritten with
   * the stubbed method
   */
  swapMethod (methodName: string, returns: Function): Module {
    this.setMethod(methodName, returns)

    return this
  }
}
