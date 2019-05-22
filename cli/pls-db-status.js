const { api: { getMongoConnection, getMongoCredentials } } = require('../')
const _ = require('lodash')
const Promise = require('bluebird')
const filesize = require('filesize')

const connection = getMongoConnection()
const credentials = getMongoCredentials()

connection.then(async conn => {
  const collections = await conn.db.listCollections().toArray().map(({ name }) => name)
  collections.sort()

  let minWidth = 22
  let docPad = 0

  collections.forEach(collection => {
    minWidth = Math.max(minWidth, collection.length)
  })

  const stats = []

  console.log(`  ${collections.length} collections:`)
  let total = 0

  await Promise.each(collections, async collection => {
    const stat = await conn.db.collection(collection).stats()
    docPad = Math.max(docPad, stat.count.toString().length)
    stats.push(Object.assign({ collection }, stat))
  })

  stats.forEach(stat => {
    const { collection, size, count } = stat
    console.log(`    > ${_.padEnd(collection, minWidth, ' ')} ${_.padStart(count, docPad, ' ')} docs (${filesize(size)})`)
    total += size
  })

  console.log(`      ${_.padEnd('', minWidth + docPad, ' ')}`)
  console.log(`      ${_.padEnd('', minWidth + docPad, ' ')}Total:  ${filesize(total)}`)
  console.log(``)
  process.exit(0)
})

console.log(`\n  MongoDB credentials:`)
let minWidth = 22

_.forOwn(credentials, (value, name) => {
  minWidth = Math.max(minWidth, name.length)
})

_.forOwn(credentials, (value, name) => {
  console.log(`    > ${_.padEnd(name, minWidth, ' ')} ${JSON.stringify(value)}`)
})

connection.on('connected', async () => {
  console.log(`\n  √ Successfully connected to host\n`)
})

connection.on('error', (err) => {
  console.error(`\n  Error while connecting to host: ${err.message}\n`)
  process.exit(1)
})
