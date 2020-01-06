const fs = require('fs')
const path = require('path')
const Promise = require('bluebird')
const { utils: { dumpCSVIntoDB }, getEntities, getPleasureEntityMap, getMongoConnection } = require('@pleasure-js/api')
const { ArgsParser } = require('@pleasure-js/utils')
const { printCommandsIndex } = require('../../lib/print-commands-index.js')

const cli = {
  root: {
    command () {
      printCommandsIndex(cli.commands)
    }
  },
  commands: [
    {
      name: 'import',
      help: 'imports csv file into the app',
      async command (args) {
        let [csvFile, entity] = args._ || []
        const opts = ArgsParser(process.argv)

        if (!csvFile) {
          console.error(`Select a csv file`)
          console.log(`Usage: pls db import <csv-file> --duplicate-check=<field-name>`)
          process.exit(0)
        }

        csvFile = path.resolve(process.cwd(), csvFile)

        if (!fs.existsSync(csvFile)) {
          console.log(`File ${ csvFile } not found`)
          process.exit(0)
        }

        const { entities } = await getEntities()

        if (!entity || !entities[entity]) {
          console.log(`Entity ${ entity } not found`)
          process.exit(1)
        }

        /*
                if (options.primaryKey) {
                  opts = { duplicateCheck: options.primaryKey }
                }
        */

        dumpCSVIntoDB(path.resolve(process.cwd(), csvFile), entity, opts)
          .catch(err => {
            console.log(`Something bad happened: ${ err.message }`)
            process.exit(1)
          })
          .then(() => {
            process.exit(0)
          })
      }
    },
    {
      name: 'sync-indexes',
      help: 'synchronizes entities indexes',
      async command () {
        const schemas = await getPleasureEntityMap()
        const conn = await getMongoConnection()

        await Promise.each(Object.keys(schemas), entityName => {
          console.log(`  Dropping indexes in ${ entityName }`)
          return conn.db.collection(entityName).dropIndexes()
        })

        /*
                const { entities } = await getEntities()

                await Promise.each(Object.keys(entities), entityName => {
                  console.log(`  Syncing indexes in ${ entityName }`)
                  return entities[entityName].syncIndexes()
                })
        */

        process.exit(0)
      }
    }
  ]
}

/**
 * @see {@link https://github.com/maxogden/subcommand}
 */
module.exports = function (subcommand) {
  return [{
    name: 'db',
    help: 'db options',
    command ({ _: args }) {
      // console.log(`calling app`, { args })
      const match = subcommand(cli)
      match(args)
    }
  }]
}
