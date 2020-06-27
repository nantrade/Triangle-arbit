module.exports = function(app) {
  app.get('/api/timestamp/', function(req, res) {
    console.log('found timestamp')
    res.send(`Welcome to api timestamp<br/>url:${req.path}`)
  })
}
