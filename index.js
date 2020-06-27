const path = require('path')
const express = require('express')
const bootinfo = require(path.join(__dirname, 'utils/bootinfo.js'))
const config = require('./config.js')()
const chalk = require('chalk')
const app = express(config.appName)
const port = process.env.PORT || config.port || 3003

const bots = require('./controllers/launcher')

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

console.log(`${chalk.cyanBright(config.appName)}`)
console.log(bootinfo())
require('./routes')(app)
app.use(express.static(path.join(__dirname, 'public')))

console.log(`Express service is running on port ${chalk.yellowBright(port)}`)
app.listen(port)
bots.reloadBot()
