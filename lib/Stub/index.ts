import { boundMethod } from 'autobind-decorator'

import { Module } from './Module'
import { UnstubbedDependency } from './UnstubbedDependency'

export interface StubOptions {
  module: string
  method: string
  returns: Function
}

export class Stub {
  static ACCESSING_UNSTUBBED_DEPENDENCY_ERROR =
    UnstubbedDependency.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR

  static INTERNAL_STUB_ERROR = Module.INTERNAL_STUB_ERROR

  private readonly stubbedModules: Map<string, Module>

  constructor () {
    this.stubbedModules = new Map()
  }

  private getModule (moduleName: string): Module {
    const mod = this.stubbedModules.get(moduleName)

    if (mod) {
      return mod
    }

    this.stubbedModules.set(moduleName, new Module(moduleName))
    return this.getModule(moduleName)
  }

  init (): void {
    this.getModule('fs').initializeAllMethods()
  }

  resetStubs (): void {
    this.stubbedModules.forEach(mod => mod.reset())
  }

  @boundMethod
  add (options: StubOptions): void {
    this.getModule(options.module).swapMethod(options.method, options.returns)
  }
}
