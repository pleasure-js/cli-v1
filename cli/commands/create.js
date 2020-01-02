const { create: createApp } = require('@pleasure-js/create-tool')
const { printCommandsIndex } = require('../../lib/print-commands-index.js')
const { askForDestination } = require('../lib/ask-for-destination.js')
const inquirer = require('inquirer')
const path = require('path')
const subcommand = require('../lib/subcommand.js')

const boilerplates = {
  'Rollup bundler': '@pleasure-js/boilerplate-rollup-bundle',
  'Vue.js component': '@pleasure-js/boilerplate-vue',
  'Pleasure full-stack': '@pleasure-js/boilerplate-full',
  // todo
  // 'Pleasure Component': 'keepwondering/pleasure-component'
}

const created = (dir, api) => {
  console.log(`\n  All done. Now go and:`)
  console.log(`  $ cd ${ path.relative(process.cwd(), dir) } # go to project`)
  console.log(`  $ yarn --production=false # install dependencies`)
  if (api) {
    console.log(`  $ pls app gencert --jwt # create ssl keys for JWT`)
  }
  console.log(`  $ $EDITOR . # open the project in your default $EDITOR`)
  console.log(``)
  console.log(`  # oneliner`)
  console.log(`  $ cd ${ path.relative(process.cwd(), dir) } && ${ api ? 'pls app gencert --jwt && ' : '' }yarn --production=false && $EDITOR .`)
}

const create = {
  name: 'create',
  help: 'scaffold a pleasure project',
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
          async command ({ _: [projectName] }) {
            const defaultRepo = path.join(__dirname, '../../../boilerplate-default')
            console.log({ defaultRepo })
            const destination = await askForDestination(projectName)
            const { config: { api } } = await createApp(defaultRepo, destination)
            created(destination, api)
            process.exit(0)
          }
        },
        {
          name: 'boilerplate',
          help: 'create custom boilerplates (rollup bundles, vue plugins, pleasure plugins)',
          async command ({ _: [projectName] }) {
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
              gitPath = path.join(__dirname, `../../../${ boilerplates[answer.boilerplate].replace(/^@pleasure-js\//, '') }`)
            }
            const destination = await askForDestination(projectName)
            await createApp(gitPath, destination)
            created(destination)
            process.exit(0)
          }
        }
      ]
    }
    const match = subcommand(CreateMain)
    match(args)
  }
}

module.exports = {
  create
}
