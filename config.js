const os = require('os')
module.exports = () => {
  return {
    appName: 'Arbitrage BOT', // Name of the application
    port: 3003, // Express server port
    logPath: os.tmpdir() // file path for logging
  }
}
