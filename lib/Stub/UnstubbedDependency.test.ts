import fs from 'fs'

import { Suite } from '../Suite'
import { UnstubbedDependency } from './UnstubbedDependency'

export const suite = new Suite({
  name: 'UnstubbedDependency'
})

suite.addTest({
  name: 'automatically mocks the fs module',
  test (t) {
    let error

    try {
      fs.readFile('filepath', function (err) {
        throw err
      })
    } catch (e) {
      error = e
    }

    t.equal({
      expected: `${
        UnstubbedDependency.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
      } fs::readFile`,
      actual: error.message
    })
  }
})

suite.addTest({
  name: 'automatically mocks the HTTP module',
  async test (t) {
    let error

    try {
      await require('http').request('http://github.com')
    } catch (e) {
      error = e
    }

    t.equal({
      expected: `${
        UnstubbedDependency.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
      } http::request`,
      actual: error.message
    })
  }
})

suite.addTest({
  name: 'automatically mocks the HTTP/2 module',
  async test (t) {
    let error

    try {
      await require('http2').createServer()
    } catch (e) {
      error = e
    }

    t.equal({
      expected: `${
        UnstubbedDependency.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
      } http2::createServer`,
      actual: error.message
    })
  }
})

suite.addTest({
  name: 'automatically mocks the net module',
  async test (t) {
    let error

    try {
      await require('net').connect()
    } catch (e) {
      error = e
    }

    t.equal({
      expected: `${
        UnstubbedDependency.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
      } net::connect`,
      actual: error.message
    })
  }
})

suite.addTest({
  name: 'automatically mocks the dns module',
  async test (t) {
    let error

    try {
      await require('dns').resolve()
    } catch (e) {
      error = e
    }

    t.equal({
      expected: `${
        UnstubbedDependency.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
      } dns::resolve`,
      actual: error.message
    })
  }
})

suite.addTest({
  name: 'automatically mocks the tls module',
  async test (t) {
    let error

    try {
      await require('tls').connect()
    } catch (e) {
      error = e
    }

    t.equal({
      expected: `${
        UnstubbedDependency.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
      } tls::connect`,
      actual: error.message
    })
  }
})

suite.addTest({
  name: 'automatically mocks the child_process module',
  async test (t) {
    let error

    try {
      await require('child_process').spawn()
    } catch (e) {
      error = e
    }

    t.equal({
      expected: `${
        UnstubbedDependency.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
      } child_process::spawn`,
      actual: error.message
    })
  }
})

suite.addTest({
  name: 'automatically mocks the process module',
  async test (t) {
    let error

    try {
      await require('process').cwd()
    } catch (e) {
      error = e
    }

    t.equal({
      expected: `${
        UnstubbedDependency.ACCESSING_UNSTUBBED_DEPENDENCY_ERROR
      } process::cwd`,
      actual: error.message
    })
  }
})
