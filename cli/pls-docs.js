#!/usr/bin/env node

const main = require('commander')
const { getConfig } = require('pleasure')

const config = getConfig()

main
  .version('0.1.0')
  .usage('<command>')
  .command('build', `build the docs in ${config.ddocs.rawPath}`)
  .command('serve', `serves built docs at ${config.ddocs.buildPath}`)
  .parse(process.argv)
