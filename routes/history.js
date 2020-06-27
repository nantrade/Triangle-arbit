const rpc = require('../utils/unifiedrpc')

module.exports = function(app) {
  app.post('/history',async function(req, res, next) {
    console.log(req.query)
    const exchange = req.query.exchange
    const symbol = req.query.symbol
    const result = await rpc.getTradesHistory(exchange,symbol)
    console.log(result[0] || result)
    res.send(result)
    next()
  })
}
