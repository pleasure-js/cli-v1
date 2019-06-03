#!/usr/bin/env node

const appCLI = require('./commands/app.js')
const pm = require('./commands/pm.js')
const { printCommandsIndex } = require('../lib/print-commands-index.js')
const { create } = require('./commands/create.js')
const { lint } = require('./commands/lint.js')
const subcommand = require('./lib/subcommand.js')
const _ = require('lodash')

/*
if (projectRoot) {
  process.chdir(findRoot())
}
*/

const commands = [
  // legacy
  create,
  lint
]

commands.push(...appCLI(subcommand))
commands.push(...pm(subcommand))

// todo: load more commands via plugins
const match = subcommand({
  root: {
    command () {
      printCommandsIndex(commands)
    }
  },
  commands
})
// todo: create help function

// console.log(process.argv.slice(2))
match(process.argv.slice(2))
