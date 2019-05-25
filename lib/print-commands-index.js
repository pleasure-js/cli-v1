const forOwn = (obj, cb) => {
  Object.keys(obj).forEach((prop) => {
    cb(obj[prop], prop)
  })
}
const printCommandsIndex = (commands) => {
  console.log(``)
  console.log(`  Commands:`)
  console.log(``)
  forOwn(commands, ({ name, help }) => {
    console.log(`  ${ name } - ${ help }`)
  })
}

module.exports = { printCommandsIndex }
