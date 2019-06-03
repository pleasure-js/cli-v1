const Table = require('cli-table')
const moment = require('moment')
const { omit } = require('lodash')

const clify = (obj) => {
  Object.keys(obj).forEach((key) => {
    const val = obj[key]
    if (val instanceof Date) {
      return obj[key] = moment(val).format()
    }
    if (val instanceof RegExp) {
      return obj[key] = val.toString()
    }
    if (typeof val === 'object') {
      return obj[key] = '[ object ]'
    }
  })

  return obj
}

function printStatus (status) {
  const head = Object.keys(omit(status[0], ['spawnArgs', 'stop']))
  const table = new Table({ head })

  status.forEach(runningProcess => {
    runningProcess.started = new Date(runningProcess.started)
    runningProcess.lastRestarted = new Date(runningProcess.lastRestarted)
    const tableVal = []
    runningProcess = clify(runningProcess)
    head.forEach(k => {
      tableVal.push(runningProcess[k])
    })
    table.push(tableVal)
  })

  console.log(table.toString())
}

module.exports = { printStatus }
