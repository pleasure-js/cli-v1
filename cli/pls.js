#!/usr/bin/env node --harmony
let main = require('./lib/pleasure-cli.js')

const { findRoot, getCLIPlugins } = require('pleasure')
process.chdir(findRoot())

// todo: load more commands via plugins
const plugins = getCLIPlugins()

/*
main
  .usage('<command>')
*/

const fnNull = _ => {}

plugins.forEach(({ cmd, description, handler, cliPath }) => {
  if (handler) {
    handler = handler.bind(null, process.argv.filter((v, index) => {
      return index !== 2
    }).map((v, index) => {
      if (cliPath && index === 1) {
        return cliPath
      }
      return v
    }))
  }

  main
    .command(cmd)
    .description(description)
    .action(handler || fnNull)
  /*
  main.command('db', 'database options')
      .command('app', 'app options')
      .command('docs', 'documentation & guide generator')
  */
})
// main.action(handler)
main.parse(process.argv)

if (!process.argv.slice(2).length) {
  main.outputHelp()
  process.exit(0)
}
