const inquirer = require('inquirer')

async function askForDestination () {
  const answer = await inquirer.prompt([
    {
      name: 'projectPath',
      message: 'Project path',
      suffix: `: ${ chalk.grey(process.cwd() + '/') }`
    }
  ])

  return path.join(process.cwd(), answer.projectPath)
}

module.exports = { askForDestination }
