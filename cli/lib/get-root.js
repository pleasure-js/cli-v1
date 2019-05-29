const path = require('path')

module.exports = {
  getRoot (...paths) {
    return path.resolve(__dirname, '../../', ...paths)
  }
}
