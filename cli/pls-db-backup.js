#!/usr/bin/env node
const main = require('commander')
const { api: { getMongoCredentials, utils: { backupDB } } } = require('../')
const filesize = require('filesize')
const fs = require('fs')
const moment = require('moment')
const path = require('path')

const mongo = getMongoCredentials()

main
  .version('0.1.0')
  .option(`-n --name [dbName]`, `DB name`, `${mongo.database}-${moment().format('YYYY-MM-DD')}`)
  .option(`-c --no-compress`, `Compress output`, false)
  .action(function (options) {
    const opts = { name: options.name, compress: options.compress }
    let started = Date.now()

    backupDB(opts)
      .catch((err) => {
        console.error(err.message)
        process.exit(1)
      })
      .then(({ db, file }) => {
        const relFile = path.relative(process.cwd(), file)
        const info = fs.lstatSync(file)
        console.log(`\n  √ MongoDB backed up (${db})`)
        console.log(`\n  Backed up in ${Date.now() - started}ms`)
        console.log(`  File: ${relFile} (${filesize(info.size)})`)
        console.log(`\n  To restore this backup, use:\n  > $ pls db restore ${relFile}\n`)
        process.exit(0)
      })
  })
  .parse(process.argv)
