const { spawn } = require('child_process')

const exec = (cmd, args, options = {}) => {
  return new Promise((resolve) => {
    spawn(cmd, args, Object.assign({ stdio: 'inherit' }, options))
      .on('exit', resolve)
  })
}

module.exports = { exec }
