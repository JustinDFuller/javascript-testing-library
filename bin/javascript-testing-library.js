#!/usr/bin/env node

const { main } = require('../dist')

const args = process.argv.slice()

main(args[2])
  .then(res => console.log('done', res))
  .catch(err => console.error('err', err))
