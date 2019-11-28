module.exports = function () {
  const Koa = require('koa')
  const serve = require('koa-static')
  const { pleasureApi } = require('pleasure-api')
  const { getConfig, findRoot, packageJson, findConfig } = require('pleasure-utils')
  const koaBody = require('koa-body')
  const { Nuxt, Builder } = require('nuxt')
  const fs = require('fs')
  const { get } = require('lodash')
  const chokidar = require('chokidar')
  const path = require('path')
  const nuxtSetup = require('./pleasure-nuxt-setup.js')

  let runningConnection
  let runningBuilder
  let runningPort
  let runningWatcher

  // start the api only?
  const apiOnly = process.argv.indexOf('--api') > 0
  const uiOnly = process.argv.indexOf('--ui') > 0

  // console.log({ apiOnly, uiOnly })

  if (apiOnly && uiOnly) {
    console.error(`Either --ui or --api. Not both.`)
    process.exit(0)
  }

  function watcher () {
    if (runningWatcher) {
      runningWatcher.close()
      runningWatcher = null
    }

    const nuxtConfigFile = findRoot('./nuxt.config.js')
    const pleasureConfigFile = findConfig()

    // delete cache
    if (fs.existsSync(nuxtConfigFile)) {
      delete require.cache[require.resolve(nuxtConfigFile)]
    }

    if (fs.existsSync(pleasureConfigFile)) {
      delete require.cache[require.resolve(pleasureConfigFile)]
    }

    const { watchForRestart = [] } = getConfig('ui')
    const cacheClean = [nuxtConfigFile/*, pleasureConfigFile*/].concat(watchForRestart)
    runningWatcher = chokidar.watch(cacheClean, { ignored: /(^|[\/\\])\../, ignoreInitial: true })

    runningWatcher.on('all', (event, path) => {
      // todo: trigger restart
      restart()
        .catch(err => {
          console.log(`restarting failed with error`, err.message)
        })
    })
  }

  async function start (port) {
    if (runningConnection) {
      console.error(`An app is already running`)
      return
    }

    const nuxtConfigFile = findRoot('./nuxt.config.js')
    const pleasureConfigFile = findConfig()

    // delete cache
    if (fs.existsSync(nuxtConfigFile)) {
      delete require.cache[require.resolve(nuxtConfigFile)]
    }
    if (fs.existsSync(pleasureConfigFile)) {
      delete require.cache[require.resolve(pleasureConfigFile)]
    }

    const apiConfig = getConfig('api')
    port = port || apiConfig.port

    let withNuxt = false
    let nuxt

    // enable nuxt
    if (fs.existsSync(nuxtConfigFile)) {
      const nuxtConfig = nuxtSetup()
      withNuxt = true
      nuxt = new Nuxt(nuxtConfig)

      // Build in development
      if (!apiOnly && nuxtConfig.dev) {
        const builder = new Builder(nuxt)
        runningBuilder = builder
        await builder.build()
      }
    }

    const app = new Koa()

    app.use(koaBody())

    const server = runningConnection = app.listen(port)
    runningPort = port

    if (!uiOnly) {
      app.use(pleasureApi({
        prefix: apiConfig.prefix,
        plugins: apiConfig.plugins
      }, server))
    }

    // nuxt
    if (!apiOnly && withNuxt) {
      app.use(ctx => {
        ctx.status = 200
        ctx.respond = false // Mark request as handled for Koa
        ctx.req.ctx = ctx // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
        nuxt.render(ctx.req, ctx.res)
      })
    }

    if (fs.existsSync(findRoot('static'))) {
      app.use(serve(findRoot('static')))
    }

    process.send && process.send('pleasure-ready')

    if (process.env.NODE_ENV === 'development') {
      watcher()
    }

    return port
  }

  async function restart () {
    if (!runningPort || !runningConnection) {
      console.error(`No app instance running`)
      return
    }

    if (runningBuilder) {
      await runningBuilder.close()
      runningBuilder = null
    }

    runningConnection.close()
    runningConnection = null
    return start(runningPort)
  }

  return {
    start,
    watcher,
    restart
  }
}
