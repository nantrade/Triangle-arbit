module.exports = function(app) {
  const os = require('os')
  app.get('/serverinfo/', function(req, res) {
    console.log(req.query)
    let response = `<h2>Booted the following process:</h2>`
    response += `<table>`
    response += `<tr><td>pid</td><td>${process.pid}</td></tr>`
    response += `<tr><td>host</td><td>${os.hostname()}</td></tr>`
    response += `<tr><td>OS</td><td>${os.release()}</td></tr>`
    response += `<tr><td>node ver</td><td>${process.version}</td></tr>`
    response += `<tr><td>path</td><td>${__dirname}</td></tr>`
    response += `<tr><td>mem used</td><td>${Math.round(100 * (1 - os.freemem() / os.totalmem()))}%</td></tr>`
    response += `<tr><td>cpu used</td><td>${Math.round(100 * (os.loadavg()[0]))}%</td></tr>`
    response += `<tr><td>uptime</td><td>${Math.floor(process.uptime()).toLocaleString()} sec</td></tr>`
    response += '<table>'
    res.send(response)
  })
}
