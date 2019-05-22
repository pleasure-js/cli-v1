#!/usr/bin/env node

const { execSync } = require('child_process')
const { api: { getPlugins }, findRoot } = require('pleasure')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const _ = require('lodash')

let { pluginsConfig: { jwt: { privateKey, publicKey } } } = getPlugins()
privateKey = findRoot(privateKey)
publicKey = findRoot(publicKey)

_.uniq([path.dirname(privateKey), path.dirname(publicKey)]).forEach(dir => {
  mkdirp.sync(dir)
})

if (fs.existsSync(privateKey) || fs.existsSync(publicKey)) {
  console.error(`  Refusing to overwrite existing keys:`)

  if (fs.existsSync(privateKey)) {
    console.log(`    `, privateKey)
  }

  if (fs.existsSync(publicKey)) {
    console.log(`    `, publicKey)
  }

  console.log(`\n  Manually remove them and try again.`)
  process.exit(1)
}

execSync(`ssh-keygen -t rsa -b 4096 -m PEM -f ${ privateKey } -N '' && openssl rsa -in ${ privateKey } -pubout -outform PEM -out ${ publicKey }`)
console.log('\n  Certs generated!\n')
process.exit(0)
