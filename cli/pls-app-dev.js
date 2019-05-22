#!/usr/bin/env node --inspect --debug-brk
const path = require('path')
const pleasurePath = path.join(__dirname, '../')
const { getConfig } = require(pleasurePath)
const nodemon = require('nodemon')

const { api } = getConfig()

nodemon(`-w pleasure.config.js -w ${ api.entitiesPath } --exec pls app start`)
