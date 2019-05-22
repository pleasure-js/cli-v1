#!/usr/bin/env node --harmony
// console.log('main')
const main = require('commander')

// todo: load more commands via plugins

main
  .version('0.1.0')
  .usage('<command>')
  .command('db', 'database options')
      .command('app', 'app options')
      .command('docs', 'documentation & guide generator')
  .parse(process.argv)
