import { boundMethod } from 'autobind-decorator'

import { Module } from './Module'
import { UnstubbedModule } from './UnstubbedModule'

const automaticallyMockedModules = ['fs', 'http', 'http2', 'net', 'dns', 'tls']

export interface StubOptions {
  module: string
  method: string
  returns: Function
}

export class Stub {
  private readonly stubbedModules: Map<string, Module>

  constructor () {
    this.stubbedModules = new Map()
    this.init()
  }

  private getModule (moduleName: string): Module {
    const mod = this.stubbedModules.get(moduleName)

    if (mod) {
      return mod
    }

    this.stubbedModules.set(moduleName, new Module(moduleName))
    return this.getModule(moduleName)
  }

  private init (): void {
    automaticallyMockedModules.forEach(moduleName =>
      this.stubbedModules.set(moduleName, new UnstubbedModule(moduleName))
    )
  }

  @boundMethod
  resetStubs (): Stub {
    this.stubbedModules.forEach(mod => mod.reset())

    return this
  }

  @boundMethod
  add (options: StubOptions): Stub {
    this.getModule(options.module).swapMethod(options.method, options.returns)

    return this
  }
}
