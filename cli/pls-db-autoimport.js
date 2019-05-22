#!/usr/bin/env node
const _ = require('lodash')
const path = require('path')
const { dumpCSVIntoDB } = require('../lib/utils/dump-csv-into-db')
const Promise = require('bluebird')

const csvFiles = process.argv.slice(2)

const processFile = csv => {
  const modelName = _.camelCase(path.parse(csv).name)
  csv = path.resolve(process.cwd(), csv)

  return dumpCSVIntoDB(csv, modelName)
}

Promise
  .each(csvFiles, processFile)
  .then(() => {
    process.exit(0)
  })
