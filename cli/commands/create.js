const { create: createApp } = require('pleasure-create-tool')
const { printCommandsIndex } = require('../../lib/print-commands-index.js')
const { askForDestination } = require('../lib/ask-for-destination.js')
const inquirer = require('inquirer')
const subcommand = require('subcommand')

const boilerplates = {
  'Rollup bundler': 'keepwondering/pleasure-boilerplate-rollup-bundle',
  'Vue.js component': 'keepwondering/pleasure-boilerplate-vue-component',
  'Pleasure full-stack': 'keepwondering/pleasure-boilerplate-full'
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
          async command ({ _: [repoName] }) {
            const defaultRepo = repoName || path.join(__dirname, '../../pleasure-boilerplate-default')
            await createApp(defaultRepo, await askForDestination())
          }
        },
        {
          name: 'boilerplate',
          help: 'create custom boilerplates (rollup bundles, vue plugins, pleasure plugins)',
          async command ({ _: args }) {
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

module.exports = {
  create
}
