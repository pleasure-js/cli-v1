#!/usr/bin/env node

const main = require('commander')

main
  .version('0.1.0')
  .usage('<command>')
  .command('import', 'import csv into entity')
  .command('autoimport', 'import files into its equivalent filename entity')
  .command('backup', 'backup database')
  .command('restore <file>', 'Restores <file> into database')
  .command('drop', 'Drops the database')
  .command('status', 'Prints db configuration and connectivity')
  .parse(process.argv)
