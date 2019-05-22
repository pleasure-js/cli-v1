#!/usr/bin/env node
const { api: { server: { start } } } = require('pleasure')

start()
  .then((port) => {
    console.log(`Pleasure running on ${ port }`)
    process.emit('pleasure-initialized')
  })
