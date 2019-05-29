#!/usr/bin/env node
const start = Date.now()
const { findRoot } = require('pleasure-utils')
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
// const projectRoot = findRoot()
console.log(`\n`)

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

const create = {
  name: 'create',
  help: 'scaffold a pleasure project',
  /*
        options: [
          {
            name: 'name',
            default: true,
            abbr: 'n',
            help: `name of the project`
          }
        ],
  */
  command: function app ({ _: args }) {
    const CreateMain = {
      root: {
        command () {
          printCommandsIndex(CreateMain.commands)
        }
      },
      commands: [
        {
          name: 'app',
          help: 'scaffold a pleasure project',
          async command ({ _: [repoName] }) {
            const defaultRepo = repoName || path.join(__dirname, '../../pleasure-boilerplate-default')
            await createApp(defaultRepo, await askForDestination())
            // console.log(`go scaffold a project ${ projectName }`, { args })
          }
        },
        {
          name: 'boilerplate',
          help: 'create custom boilerplates (rollup bundles, vue plugins, pleasure plugins)',
          async command ({ _: args }) {
            const boilerplates = {
              'Rollup bundler': 'keepwondering/pleasure-boilerplate-rollup-bundle',
              'Vue.js component': 'keepwondering/pleasure-boilerplate-vue-component',
              'Pleasure full-stack': 'keepwondering/pleasure-boilerplate-full'
            }
            const answer = await inquirer.prompt([
              {
                type: 'list',
                name: 'boilerplate',
                message: 'Pick a boilerplate',
                choices: Object.keys(boilerplates)
              }
            ])
            let gitPath = `https://github.com/${ boilerplates[answer.boilerplate] }`

            if (process.env.NODE_ENV === 'development' && process.env.DEV_ENV === 'tin') {
              gitPath = path.join(__dirname, `../../${ boilerplates[answer.boilerplate].replace(/^keepwondering\//, '') }`)
            }
            try {
              const destination = await askForDestination()
              await createApp(gitPath, destination)
              console.log(`\n  All done. Now go and:\n  $ cd ${ path.relative(process.cwd(), destination) } && yarn --production=false`)
            } catch (err) {
              console.log(`error installing ${ gitPath }`)
              console.error(err.message)
            }
          }
        }
      ]
    }
    const match = subcommand(CreateMain)
    match(args)
  }
}

const commands = [
  // legacy
  create
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
