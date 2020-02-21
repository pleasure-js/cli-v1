const fs = require('fs')
const path = require('path')
const { mkdirpSync, readJson, remove, pathExists } = require('fs-extra')
const _ = require('lodash')
const { exec } = require('../lib/exec.js')
const { getMongoConnection, getMongoCredentials } = require('@pleasure-js/api')
const { findRoot, findPackageJson, packageJson, getConfig } = require('@pleasure-js/utils')
const { DaemonizerServer } = require('@pleasure-js/daemonizer')
const { DaemonizerClient } = require('@pleasure-js/daemonizer/dist/daemonizer-client.js')
const { printStatus } = require('../lib/print-status.js')
const inquirer = require('inquirer')
const chalk = require('chalk')
const deploy = require('@pleasure-js/deploy')
const subcommand = require('subcommand')

const { printCommandsIndex } = require('../../lib/print-commands-index.js')
const Server = require('../../lib/server.js')
const Generator = require('../../lib/generator.js')

const isPleasureProject = () => {
  try {
    getConfig()
    return true
  } catch (err) {
    return false
  }
}

const requirePleasureProject = () => {
  if (!isPleasureProject()) {
    throw new Error(`Pleasure project not found.\nYou can create one by:\n$ pls create app`)
  }
}

const empty = s => {
  return /^[\s]*$/.test(s)
}

const cli = {
  root: {
    command () {
      printCommandsIndex(cli.commands)
    }
  },
  commands: [
    {
      name: 'dev',
      help: 'start the app in development mode',
      async command () {
        requirePleasureProject()
        const { start } = Server()
        const port = await start()
        console.log(`Pleasure running on ${ port }`)
        process.emit('pleasure-initialized')
      }
    },
    {
      name: 'gen',
      help: 'generate static html files',
      async command () {
        requirePleasureProject()
        await Generator()
        console.log(`Pleasure generated!`)
        process.emit('pleasure-generated')
        process.exit(0)
      }
    },
    {
      name: 'build',
      help: 'build production files',
      async command () {
        requirePleasureProject()
        const overrideNuxtConfig = {}
        if (process.env.PLEASURE_BUILD_DIR) {
          Object.assign(overrideNuxtConfig, {
            buildDir: process.env.PLEASURE_BUILD_DIR
          })
        }
        await Generator({ buildOnly: true, overrideNuxtConfig })
        console.log(`Pleasure generated!`)
        process.emit('pleasure-generated')
        process.exit(0)
      }
    },
    {
      name: 'start',
      help: 'start the app in production (background)',
      async command () {
        requirePleasureProject()
        DaemonizerServer.ensureRunning()
        const Daemonizer = DaemonizerClient.instance()
        const id = packageJson().name

        const forked = await Daemonizer.fork({
          id,
          spawnArgs: {
            command: 'pls',
            args: ['app', 'dev']
          },
          runningProcessOptions: {
            cwd: findRoot(),
            env: Object.assign({}, process.env, {
              PLEASURE_PRODUCTION: true
            })
          }
        })
        printStatus(await Daemonizer.status(id))
        // console.log(`Running '${ id }' (pid = ${ pid })`)
        process.exit(0)
      }
    },
    {
      name: 'stop',
      help: 'stops a running production app',
      async command (args) {
        requirePleasureProject()
        await DaemonizerServer.ensureRunning()
        const Daemonizer = DaemonizerClient.instance()
        const id = packageJson().name

        await Daemonizer.stop(id)
        console.log(`'${ id }' has been stopped.`)
        process.exit(0)
      }
    },
    {
      name: 'status',
      help: 'checks whether the app is running or not',
      async command () {
        requirePleasureProject()
        await DaemonizerServer.ensureRunning()
        const Daemonizer = DaemonizerClient.instance()
        const id = packageJson().name

        console.log(`status`, { id })
        const status = await Daemonizer.status(id)
        const running = status.length === 1

        if (!running) {
          throw new Error(`${ id } is NOT running.`)
        }

        printStatus(status)
        process.exit(0)
      }
    },
    {
      name: 'diagnose',
      help: 'prints useful status info of the application',
      async command () {
        // DB
        const credentials = getMongoCredentials()
        console.log(`Connecting to ${ credentials.database }@${ credentials.host } on port ${ credentials.port }`)
        await new Promise((resolve, reject) => {
          const conn = getMongoConnection(credentials)
          conn.on('connected', resolve)
          conn.on('error', reject)
        })
        console.log(`Connected!`)
        process.exit(0)
      }
    },
    {
      name: 'gencert',
      help: 'generate SSL certs for JWT authentication or other',
      async command (args) {
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
        const { getPlugins } = require('@pleasure-js/api')

        const isJwt = process.argv.indexOf('--jwt') >= 0

        let privateKey
        let publicKey

        const proceedWithJwt = () => {
          ({ pluginsConfig: { jwt: { privateKey, publicKey } } } = getPlugins())

          privateKey = findRoot(privateKey)
          publicKey = findRoot(publicKey)
        }

        if (isJwt) {
          proceedWithJwt()
        } else if (isPleasureProject()) {
          const askJWT = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'jwt',
              message: 'Would you like to setup keys for the JWT plugin?',
              default: true
            }
          ])

          if (askJWT.jwt) {
            proceedWithJwt()
          }
        } else {
          console.log(chalk.yellow(`BE AWARE! You are not in a pleasure project.`))
        }

        if (!privateKey || !publicKey) {
          const askForKeysDestination = await inquirer.prompt([
            {
              name: 'privateKey',
              suffix: ` ${ process.cwd() }/`,
              default: `ssl-keys/private.key`,
              message: 'Private key destination:',
              validate (privateKey) {
                return empty(privateKey) ? 'Enter a private key destination' : true
              }
            },
            {
              name: 'publicKey',
              suffix: ` ${ process.cwd() }/`,
              default: `ssl-keys/public.key.pub`,
              message: 'Public key destination:',
              validate (publicKey) {
                return empty(publicKey) ? 'Enter a public key destination' : true
              }
            }
          ]);

          ({ privateKey, publicKey } = askForKeysDestination)
          privateKey = path.join(process.cwd(), privateKey)
          publicKey = path.join(process.cwd(), publicKey)
        }

        _.uniq([path.dirname(privateKey), path.dirname(publicKey)]).forEach(dir => {
          mkdirpSync(dir)
        })

        if (fs.existsSync(privateKey) || fs.existsSync(publicKey)) {
          const askToOverwrite = await inquirer.prompt({
            type: 'confirm',
            name: 'overwrite',
            default: false,
            message: 'Keys already exists, would you like to delete them?\nIMPORTANT! Be aware that any tokens signed with these keys may stop working in your application',
          })

          if (!askToOverwrite.overwrite) {
            console.log(chalk.red(`\n  Refusing to overwrite existing keys:`))

            if (fs.existsSync(privateKey)) {
              console.log(`    `, privateKey)
            }

            if (fs.existsSync(publicKey)) {
              console.log(`    `, publicKey)
            }

            console.log(`\n  Manually remove them and try again:`)
            console.log(`  $ rm ${ privateKey } ${ publicKey }`)
            process.exit(1)
          }

          await remove(privateKey)
          await remove(publicKey)
        }

        await exec(`ssh-keygen -t rsa -b 4096 -m PEM -f ${ privateKey } -N '' && openssl rsa -in ${ privateKey } -pubout -outform PEM -out ${ publicKey }`)
        // console.log({ res: res.toString() })
        console.log('  SSL created:')
        console.log(`  Private key: ${ path.relative(process.cwd(), privateKey) }`)
        console.log(`  Public key: ${ path.relative(process.cwd(), publicKey) }`)
        process.exit(0)
      }
    },
    deploy({ printCommandsIndex, subcommand })
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
