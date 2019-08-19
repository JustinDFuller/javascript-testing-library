# javascript-testing-library

A highly opinionated testing library for JavaScript

## Install

```bash
npm install javascript-testing-library --save-dev
```

## Usage

```js
// User.test.js
import { Suite } from 'javascript-testing-library'

import { User } from './User'

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

    const user = User({
      name: 'Justin'
    })
    
    const actual = await user.upsert()

    t.equal({
      expected: {
        id: 1,
        name: 'Justin'
      },
      actual
    })
  }
})
```

## What it is

`javascript-testing-library` is meant to force good testing practices onto a JavaScript application.

### Using this library will encourage you to write... 

* Fast tests, because all expensive IO is disallowed by default.
* Focused tests, because only one assertion is allowed per-test.
* Useful tests, because it does not allow you assert against the results of `typeof`. You have to assert against an actual value.

### Using this library will discourage you from writing... 

* Brittle tests, because it only allows you to stub external modules.
* Flakey tests, because it disallows expensive IO like http requests and file system operations.

### This library will not allow you to...

* Skip a test.
* Have more than one assertion per-test.
* Use any assertion besides deep strict equality.
* Use callbacks in tests (it does allow async/await & promises).
* Mock or stub internal modules.
* Make unmocked http requests or file system operations.
* Use a setup/teardown construct that shares state between tests.
* Forget to restore a stubbed function, because they are automatically restored after each test.
