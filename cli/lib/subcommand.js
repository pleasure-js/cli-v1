const { trapCommandsErrors } = require('./trap-commands-errors.js')
const subcommand = require('subcommand')

module.exports = function (commands) {
  return subcommand(trapCommandsErrors(commands))
}
