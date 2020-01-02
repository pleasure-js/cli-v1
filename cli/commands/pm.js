const { Daemonizer } = require('@pleasure-js/daemonizer')
const inquirer = require('inquirer')
const { printStatus } = require('../lib/print-status.js')

const { printCommandsIndex } = require('../../lib/print-commands-index.js')

const cli = {
  root: {
    command () {
      printCommandsIndex(cli.commands)
    }
  },
  commands: [
    {
      name: 'list',
      help: 'lists running processes',
      async command () {
        const ProcessManager = new Daemonizer()
        try {
          const status = await ProcessManager.status()
          if (status.length > 0) {
            printStatus(status)
          }
        } catch (err) {
          console.log(err.message)
        }
        process.exit(0)
      }
    },
    {
      name: 'stop',
      help: 'stops a given process id',
      async command ({ _: [processId] }) {
        const ProcessManager = new Daemonizer()
        const stopProcess = async id => {
          const ProcessManager = new Daemonizer()
          await ProcessManager.stop(id)
          console.log(`'${ id }' has been stopped.`)
        }

        if (processId) {
          await stopProcess(processId)
          process.exit(0)
        }

        const status = await ProcessManager.status()

        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'subProcess',
            message: 'Pick a sub-process',
            choices: status.map(({ id }) => id)
          }
        ])

        await stopProcess(answer.subProcess)
        process.exit(0)
      }
    }
  ]
}

/**
 * @see {@link https://github.com/maxogden/subcommand}
 */
module.exports = function (subcommand) {
  return [{
    name: 'pm',
    help: 'pleasure process manager',
    command ({ _: args }) {
      // console.log(`calling app`, { args })
      const match = subcommand(cli)
      match(args)
    }
  }]
}
