#!/usr/bin/env node --harmony
const { findRoot, getCLIPlugins } = require('pleasure')
const { printCommandsIndex } = require('../lib/print-commands-index.js')
const subcommand = require('subcommand')

process.chdir(findRoot())

const commands = getCLIPlugins(subcommand)

// todo: load more commands via plugins
const match = subcommand({
  root: {
    command() {
      printCommandsIndex(commands)
    }
  },
  commands
})
// todo: create help function

// console.log(process.argv.slice(2))
match(process.argv.slice(2))
