
let storage = require('../utils/storage')

module.exports = function(app) {
  app.post('/getconfig',async function(req, res, next) {

    res.send(storage)
    next()

  })
}
