const _ = require('lodash')

const trapCommandError = (command) => {
  return async function (...args) {
    try {
      await command(...args)
    } catch (err) {
      console.log(err.message)
      process.exit(0)
    }
  }
}

const trapCommandsErrors = (commands) => {
  if (_.get(commands, 'root.command')) {
    commands.root.command = trapCommandError(commands.root.command)
  }

  if (commands.command) {
    commands.command = trapCommandError(commands.command)
  }

  (commands.commands || []).forEach(trapCommandsErrors)
  return commands
}

module.exports = { trapCommandsErrors }
