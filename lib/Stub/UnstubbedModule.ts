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
      process: ['kill', '_kill']
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
    Object.keys(this.module)
      .filter(
        propertyName => !this.exclusions.has(this.moduleName, propertyName)
      )
      .forEach(propertyName => {
        const property = this.getMethod(propertyName)

        if (isFunction(property)) {
          this.saveOriginalMethod(propertyName)
          this.setMethod(
            propertyName,
            new UnstubbedDependency(this.moduleName, propertyName)
              .throwUnstubbedError
          )
        }
      })

    return this
  }

  // reimplement swapMethod WITHOUT saving the (currently stubbed) original method
  swapMethod (methodName: string, returns: Function): Module {
    this.setMethod(methodName, returns)

    return this
  }
}
