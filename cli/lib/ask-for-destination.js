const inquirer = require('inquirer')
const chalk = require('chalk')
const path = require('path')

async function askForDestination (def) {
  const answer = await inquirer.prompt([
    {
      name: 'projectPath',
      message: 'Project path',
      default: def,
      suffix: `: ${ chalk.grey(process.cwd() + '/') }`
    }
  ])

  return path.join(process.cwd(), answer.projectPath)
}

module.exports = { askForDestination }
