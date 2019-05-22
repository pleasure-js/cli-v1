#!/usr/bin/env node

const path = require('path')
const { findRoot, api: { server: { start } } } = require('pleasure')

process.chdir(findRoot())

start()
  .then((port) => {
    console.log(`Pleasure running on ${ port }`)
    process.emit('pleasure-initialized')
  })
