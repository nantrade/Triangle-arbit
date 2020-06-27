
let storage = require('../utils/storage')

module.exports = function(app) {
  app.post('/setexchangesconfig',async function(req, res, next) {

    console.log(req.query)
    const params = req.query
    const exchange = req.query.exchange
    const data = req.query.data
    const triangulation = req.query.triangulation
    const arbitrage = req.query.arbitrage

    if (Object.keys(params).includes('exchange')){
      if (Object.keys(storage.exchangesconfig).includes(exchange)){
        if (data == 'true'){
          console.log('true')
          storage.exchangesconfig[exchange].data = true
        } 
        if (data == 'false'){
          console.log('false')
          storage.exchangesconfig[exchange].data = false
        } 
        if (arbitrage == 'true'){
          console.log('true')
          storage.exchangesconfig[exchange].arbitrage = true
        } 
        if (arbitrage == 'false'){
          console.log('false')
          storage.exchangesconfig[exchange].arbitrage = false
        } 
        if (triangulation == 'true'){
          console.log('true')
          storage.exchangesconfig[exchange].triangulation = true
        } 
        if (triangulation == 'false'){
          console.log('false')
          storage.exchangesconfig[exchange].triangulation = false
        } 
      }
    }
    
    //storage[param.name] = param.value

    console.log(storage.exchangesconfig)
    res.send(storage)
    next()

  })
}
