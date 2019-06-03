const chalk = require('chalk')
const { getRoot } = require('../lib/get-root.js')
const { exec } = require('../lib/exec.js')
const { pathExists, readJson } = require('fs-extra')
const { findRoot } = require('pleasure-utils')
const fs = require('fs')
const path = require('path')

const localOptions = [
  '--legacy' // prevents from running local found lint script
]

const lint = {
  name: 'lint',
  help: 'JS lint current directory excluding .gitignore or triggers current project\'s `lint` script.',
  async command ({ _: args }) {
    const pckJson = findRoot('package.json')
    let dargs = process.argv.filter(a => localOptions.indexOf(a) < 0 && /^-/.test(a))

    const localEslintConfigFound = fs.readdirSync(findRoot()).filter(f => /^\.eslint\./.test(f)).length > 0

    console.log({ localEslintConfigFound })
    if (!localEslintConfigFound) {
      dargs.push('-c', path.join(__dirname, '../lib/.eslintrc.js'))
    }

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

        process.exit(0)
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
    process.exit(0)
  }
}

module.exports = {
  lint
}
