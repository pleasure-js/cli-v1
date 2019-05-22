const main = require('commander')
const { dumpCSVIntoDB } = require('../lib/utils/dump-csv-into-db.js')
const { models } = require('../lib/utils/models.js')
const path = require('path')
const fs = require('fs')

let exec = false

main
  .version('0.1.0')
  .usage('<entity> <csvFile>')
  .arguments('<entity> <csvFile>')
  .option('-p --primary-key [_id]', `Avoid duplicate entries by given property`)
  .action(function (entity, csvFile, options) {
    exec = true
    console.log(Object.keys(models))

    if (!entity || !models[entity]) {
      console.log(`Entity ${entity} not found`)
      process.exit(1)
    }

    csvFile = path.resolve(process.cwd(), csvFile)

    if (!fs.existsSync(csvFile)) {
      console.log(`File ${csvFile} not found`)
      process.exit(0)
    }

    let opts

    if (options.primaryKey) {
      opts = { duplicateCheck: options.primaryKey }
    }

    dumpCSVIntoDB(path.resolve(process.cwd(), csvFile), entity, opts)
      .catch(err => {
        console.log(`Something bad happened: ${err.message}`)
        process.exit(1)
      })
      .then(() => {
        process.exit(0)
      })
  })
  .parse(process.argv)

if (!exec) {
  main.help()
}
