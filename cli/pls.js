#!/usr/bin/env node
const path = require('path')
const pkg = require(path.join(__dirname, '../package.json'))
const chalk = require('chalk')

const parent = (() => {
  const dir = __dirname.split('/')
  return dir[dir.length - 3]
})()

console.log(chalk.green(`${ pkg.name } ${ pkg.version }`))

if (parent && parent === 'packages') {
  console.log(chalk.cyan(`running local version of ${ pkg.name }`))
}

const appCLI = require('./commands/app.js')
const db = require('./commands/db.js')
// const docs = require('./commands/docs.js')
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
// commands.push(...docs(subcommand))
commands.push(...db(subcommand))
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
