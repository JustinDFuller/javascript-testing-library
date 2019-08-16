# javascript-testing-library

This library is a highly opinionated testing library for JavaScript

## Install

```bash
npm install javascript-testing-library
```

## Usage

```js
// user.test.js
import { Suite } from 'javascript-testing-library'

import { user } from './user'

export const suite = Suite({
  name: 'User',
})
 
suite.addTest({
  name: 'can be added',
  async test(t) {
    t.stub({
      module: 'sequelize',
      method: 'upsert',
      returns(options) {
        return {
          id: 1,
          name: options.name,
        }
      }
    })

    const user = await user.upsert({
      name: 'Justin'
    })

    t.equal({
      expected: {
        id: 1,
        name: 'Justin'
      },
      actual: user
    })
  }
})
```

## What it is

`javascript-testing-library` is meant to force good testing practices onto a JavaScript application.

Using this library will encourage you to write fast tests, 
because all expensive IO is disallowed by default.

Using this library will encourage you to write small tests, 
because only one assertion is allowed per-test.

Using this library will encourage you to write useful tests, 
because it does not allow you assert against the results of `typeof`. 
You have to assert against an actual value.

Using this library will discourage you from writing brittle tests,
because it only allows you to stub external modules.

Using this library will discourage you from writing flakey tests,
because it disallows expensive IO like http requests and file system operations.

## What it won't allow you to do

* Skip a test
* Have more than one assertion per-test
* Use any assertion besides deep strict equality
* Use callbacks in tests (it does allow async/await & promises)
* Mock or stub internal modules
* Use unmocked http or file system operations
* Use a setup/teardown construct
* Forget to restore a stubbed function, because they are automatically restored after each test

