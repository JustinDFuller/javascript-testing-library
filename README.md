# javascript-testing-library

This library is a highly opinionated testing library for JavaScript

## Install

```bash
npm install javascript-testing-library
```

## Usage

```js
const { suite } = require('javascript-testing-library')

suite({
  name: 'User',
  tests(test) {
    test({
      name: 'can be added',
      async callback(t) {
        const user = // do something
        t.equal({
          expected: {
            id: 1,
            name: 'Justin'
          },
          actual: user
        })
      }
    })
  }
})
```

## What it is

javascript-testing-library is meant to force good testing practices onto a JavaScript application.

Using this library will encourage you to write fast tests, 
because all expensive IO is disallowed by default.

Using this library will encourage you to write small tests, 
because only one assertion is allowed per-test.

Using this library will encourage you to write useful tests, 
because it does not allow you assert against the results of `typeof`. 
You have to assert against an actual value.

## What it won't allow you to do

* Skip a test
* Have more than one assertion per-test
* Use any assertion besides deep strict equality
* Use callbacks in tests (it does allow async/await & promises)
* Mock or stub internal modules
* Use unmocked http or file system operations
* Use a before/after beforeEach/afterEach construct

