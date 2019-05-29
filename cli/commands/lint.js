const chalk = require('chalk')
const { spawn } = require('child_process')
const { getRoot } = require('../lib/get-root.js')
const { pathExists, readJson } = require('fs-extra')
const { findRoot } = require('pleasure-utils')

const exec = (cmd, args, options = {}) => {
  return new Promise((resolve) => {
    spawn(cmd, args, Object.assign({ stdio: 'inherit' }, options))
      .on('exit', resolve)
  })
}

const localOptions = [
  '--legacy' // prevents from running local found lint script
]

const lint = {
  name: 'lint',
  help: 'JS lint current directory excluding .gitignore or triggers current project\'s `lint` script.',
  async command ({ _: args }) {
    const pckJson = findRoot('package.json')
    let dargs = process.argv.filter(a => localOptions.indexOf(a) < 0 && /^-/.test(a))

    if (process.argv.indexOf('--legacy') < 0 && await pathExists(pckJson)) {
      const { scripts } = await readJson(pckJson)
      if (scripts && scripts.hasOwnProperty('lint')) {
        // run local lint
        console.log(chalk.yellow(`running local found lint... to use legacy, add --legacy`))
        const { stdout, stderr } = await exec(`yarn`, ['lint'].concat(dargs), {
          cwd: findRoot(),
          stdio: 'inherit'
        })

        stdout && console.log(stdout)
        stderr && console.log(stderr)

        return stdout
      }
    }

    dargs = dargs.concat(['--ext', '.js,.vue'])
    const gitignore = findRoot('.gitignore')

    if (pathExists(gitignore)) {
      dargs.push('--ignore-path', gitignore)
    }

    dargs.push(findRoot())
    const { stdout, stderr } = await exec(getRoot('node_modules/.bin/eslint'), dargs, { stdio: 'inherit' })
    stdout && console.log(stdout)
    stderr && console.log(stderr)
  }
}

module.exports = {
  lint
}
