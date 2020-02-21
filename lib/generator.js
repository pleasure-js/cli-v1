module.exports = async function ({ buildOnly = false, overrideNuxtConfig = {} } = {}) {
  const { findRoot } = require('@pleasure-js/utils')
  const nuxtConfigFile = findRoot('./nuxt.config.js')
  const { Nuxt, Builder, Generator } = require('nuxt')
  const fs = require('fs')
  const fse = require('fs-extra')
  const nuxtSetup = require('./pleasure-nuxt-setup.js')

  // enable nuxt
  if (!fs.existsSync(nuxtConfigFile)) {
    throw new Error(`Nuxt config not found!`)
  }

  const nuxt = new Nuxt(nuxtSetup({ overrideNuxtConfig }))
  const builder = new Builder(nuxt)
  // fse.ensureDirSync(path.resolve(this.options.buildDir, 'dist', 'client'))
  if (buildOnly) {
    builder.forGenerate()
    await builder.build()
    console.log(`built!`)
    return
  }
  const generator = new Generator(nuxt, builder)
  console.log(generator)
  console.log(`generator initialized`)
  return generator.generate()
}
