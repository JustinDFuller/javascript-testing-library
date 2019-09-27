#!/usr/bin/env node

const meow = require('meow')
const { main } = require('../dist')

const cli = meow(`
  Usage
    $ javascript-testing-library <input>

  Options
    --watch, -w                 Run tests on changes.
    --coverage, -c              Run tests in coverage mode.
    --detect-flakey-tests, -d   Find and report flakey tests.
    --run-all, -r               Run all tests, don't exit on first failure.

  Examples
    $ javascript-testing-library lib/**/*.test.ts
`)

main(cli.input[0])
