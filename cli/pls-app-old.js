#!/usr/bin/env node

const main = require('commander')

main
  .version('0.1.0')
  .usage('<command>')
  .command('start', 'start the application in production mode (background)')
  .command('stop', 'stops the application running in background')
  .command('dev', 'start the application in dev mode')
  .command('status', 'application status!')
  .command('gencert', 'generates SSL certificates for JWT and password encryption')
  .parse(process.argv)
