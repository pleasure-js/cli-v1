#!/usr/bin/env node
const appCLI = require('../lib/app.js')

const { printCommandsIndex } = require('../lib/print-commands-index.js')
const subcommand = require('subcommand')
// console.log('here!', Date.now() - start)
const { create: createApp } = require('pleasure-create-tool')
// console.log('here!', Date.now() - start)
const path = require('path')
const _ = require('lodash')
const inquirer = require('inquirer')
const chalk = require('chalk')
const { create } = require('./commands/create.js')
const { lint } = require('./commands/lint.js')
// const projectRoot = findRoot()

/*
if (projectRoot) {
  process.chdir(findRoot())
}
*/
const askForDestination = async () => {
  const answer = await inquirer.prompt([
    {
      name: 'projectPath',
      message: 'Project path',
      suffix: `: ${ chalk.grey(process.cwd() + '/') }`
    }
  ])

  return path.join(process.cwd(), answer.projectPath)
}

const commands = [
  // legacy
  create,
  lint
]
commands.push(...appCLI(subcommand))

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
