const { printCommandsIndex } = require('./print-commands-index.js')
const Server = require('./server.js')

const cli = {
  root: {
    command () {
      printCommandsIndex(cli.commands)
    }
  },
  commands: [
    {
      name: 'start',
      help: 'starts the app in production',
      async command (args) {
        const { start } = Server()
        const port = await start()
        console.log(`Pleasure running on ${ port }`)
        process.emit('pleasure-initialized')
      }
    }
  ]
}

/**
 * @see {@link https://github.com/maxogden/subcommand}
 */
module.exports = function (subcommand) {
  return [{
    name: 'app',
    help: 'app options',
    command ({ _: args }) {
      // console.log(`calling app`, { args })
      const match = subcommand(cli)
      match(args)
    }
  }]
}
