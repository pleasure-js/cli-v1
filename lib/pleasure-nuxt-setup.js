module.exports = function setup () {
  // enable nuxt
  const fs = require('fs')
  const path = require('path')
  const { get } = require('lodash')
  const { getConfig, findRoot, packageJson, findConfig } = require('pleasure-utils')
  const nuxtConfigFile = findRoot('./nuxt.config.js')

  if (!fs.existsSync(nuxtConfigFile)) {
    throw new Error(`Nuxt config not found!`)
  }

  let nuxtConfig = require(nuxtConfigFile)
/*
  nuxtConfig.generate = {
    dir: nuxtConfig.buildDir
  }
*/

  const currentModules = nuxtConfig.modules = get(nuxtConfig, 'modules', [])
  const currentModulesDir = nuxtConfig.modulesDir = get(nuxtConfig, 'modulesDir', [])
  // nuxtConfig.buildDir = findRoot('dist')
  //console.log({ currentModulesDir })
  currentModulesDir.push(...require.main.paths.filter(p => {
    return currentModulesDir.indexOf(p) < 0
  }))
  //console.log({ currentModulesDir })
  const ui = ['pleasure-ui-nuxt', {
    root: findRoot(),
    name: packageJson().name,
    config: getConfig('ui'),
    pleasureRoot: findRoot()
  }]
  currentModules.push(ui)

  fs.writeFileSync(findRoot(`final-config.json`), JSON.stringify(nuxtConfig, null, 2))

  return nuxtConfig
}
