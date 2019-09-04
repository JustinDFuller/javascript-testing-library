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
      fs: ['ReadStream'],
      net: ['Socket'], // currently don't understand why this exclusion is needed
      process: ['exit', 'binding']
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
          this.swapMethod(
            propertyName,
            new UnstubbedDependency(this.moduleName, propertyName)
              .throwUnstubbedError
          )
        }
      }
    }

    return this
  }
}
