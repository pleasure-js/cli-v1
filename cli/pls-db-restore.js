const MongoBackupRestore = require('../lib/mongo-backup-restore')
const filesize = require('filesize')
const path = require('path')
const fs = require('fs')
const copydir = require('copy-dir')
const { TMP_PATH, UPLOAD_PATH } = require('../lib/utils/project-paths.js')
const commandLineArgs = require('command-line-args')
const tar = require('tar')
const mkdirp = require('mkdirp')
const md5 = require('md5')
const rimraf = require('rimraf')

const started = Date.now()

const optionDefinitions = [
  { name: 'file', alias: 'i', type: String, defaultOption: true }
]

const options = commandLineArgs(optionDefinitions)

if (!options.file || !fs.existsSync(options.file)) {
  console.error(`\n  Select the tar file of the DB to restore --file [tar file]\n`)
  process.exit(1)
}

async function restore () {
  const { file } = options
  const extractionFolder = path.join(TMP_PATH, md5(Date.now()))

  mkdirp.sync(extractionFolder)

  console.log('')

  await tar.x({
    file,
    cwd: extractionFolder
  })

  const mongodbBackup = path.join(extractionFolder, 'mongodb')

  const MDB = await new MongoBackupRestore(mongodbBackup)
  MDB._verbose = true
  await MDB.restore()
  const info = fs.lstatSync(file)

  copydir.sync(path.join(extractionFolder, 'tmp'), TMP_PATH)
  console.log(`  √ tmp folder restored`)
  copydir.sync(path.join(extractionFolder, 'uploads'), UPLOAD_PATH)
  console.log(`  √ uploads restored`)

  rimraf.sync(extractionFolder)

  console.log(`\n  Back-up restored in ${Date.now() - started}ms\n  File: ${file} (${filesize(info.size)})\n`)
  process.exit(0)
}

restore()
