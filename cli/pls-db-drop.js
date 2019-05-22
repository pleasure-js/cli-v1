const { dropDB } = require('pleasure/src/lib/utils/drop-db')
const { backupDB } = require('../lib/backup-db')
const { TMP_PATH, UPLOAD_PATH } = require('../lib/utils/project-paths.js')
const commandLineArgs = require('command-line-args')
const Promise = require('bluebird')
const rimraf = Promise.promisify(require('rimraf'))

const optionDefinitions = [
  { name: 'force', alias: 'f', type: Boolean, defaultOption: false }
]

const options = commandLineArgs(optionDefinitions)

async function cleanDB () {
  if (process.env.NODE_ENV === 'production') {
    console.log(`\n  Backing up before dropping on production...`)
    await backupDB()
  }

  await dropDB()
  await rimraf(TMP_PATH)
  await rimraf(UPLOAD_PATH)
  process.exit(0)
}

if (process.env.NODE_ENV === 'production' && !options.force) {
  console.log(`\n  Can't drop a db on production. Unless you use the force...\n`)
  process.exit(1)
}

cleanDB()
