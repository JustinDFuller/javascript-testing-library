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
  name: 'can upsert a user with only a name',
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

* Fast tests, because all expensive input and output are disabled.
* Focused tests, because only one assertion is allowed per-test.
* Useful tests, because it does not allow you to assert against the results of `typeof`. You have to assert against an actual value.

### Using this library will discourage you from writing... 

* Brittle tests, because it only allows you to stub external modules.
* Flakey tests, because it disables unreliable inputs and outputs like HTTP requests and file system operations.

### This library will not allow you to...

* Skip a test.
* Have more than one assertion per-test.
* Use any assertion besides deep strict equality.
* Mock or stub internal modules.
* Make unmocked HTTP requests or file system operations.
* Use a setup/teardown construct that shares state between tests.
* Forget to restore a stubbed function, because they are automatically restored after each test.

## TODO
* [x] Pretty printed output
* [x] Automatically stub node http
* [x] Automatically stub node https
* [x] Automatically stub node http/2
* [x] Automatically stub node net
* [x] Automatically stub node dns
* [x] Automatically stub node tls
* [ ] Run each test file in its own process
* [ ] Find and run related tests
* [ ] CLI
* [ ] Gracefully handle invalid test files

## Output

### Error
Errors show a diff, including for objects an arrays. The stack trace will highlight the test file that the error happened in.

<img src="https://raw.githubusercontent.com/JustinDFuller/javascript-testing-library/master/docs/errors.png" width="100%" />

### Success

<img src="https://raw.githubusercontent.com/JustinDFuller/javascript-testing-library/master/docs/Output.png" width="100%" />

