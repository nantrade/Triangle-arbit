const fs = require('fs')

module.exports = function(app) {
  console.log(`mounting routes`)
  fs.readdirSync(__dirname).forEach(function(file) {
    if (file !== 'index.js') {
      let name = file.substring(0, file.indexOf('.'))
      require('./' + name)(app)
      console.log(` - /${name.replace('~', '/')}/`)
    }
  })
}
