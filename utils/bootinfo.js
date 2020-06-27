const os = require('os')
const chalk = require('chalk')
module.exports = function bootlog() {
  return `\tBooting the following process: \n\tpid:\t${chalk.yellow(process.pid)} \n\thost:\t${chalk.yellowBright(os.hostname)}\n\tpath:\t${chalk.yellowBright(__dirname)}`
}
