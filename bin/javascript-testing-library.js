#!/usr/bin/env node

const { cli } = require('../dist/cli')

const close = () => {
  process.exit()
}

process.on('SIGINT', close)
process.on('SIGTERM', close)

cli()
