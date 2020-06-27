let exchanges = [
    'binance',
    'bithumb'
]

let implementedexchanges = [
    'binance',
    'bithumb',
    'upbit'
]

let exchangesconfig = {
    'binance':{
        data: true,
        triangulation: false,
        arbitrage: false
    },
    'bithumb':{
        data: true,
        triangulation: false,
        arbitrage: false
    },
    'upbit':{
        data: false,
        triangulation: false,
        arbitrage: false
    },
}

let baseamount = 20

let commoncoins = [
    'BTC','ETH','USDT','KRW'
]

let fees = {
    binance: 0.001,
    bithumb: 0.001,
    upbit:   0.001
}

let amountbuffer = 0.005

let minimalprofit = 0.05 // percent

let dataTooOld = 35000

let markets = {}

let profits = {
    toosmall: 0,
    realized: {
        success: 0,
        failure: 0
    },
    prediction: {
        success: 0,
        failure: 0
    }
}
 
module.exports = {
    exchanges,
    implementedexchanges,
    exchangesconfig,
    baseamount,
    commoncoins,
    fees,
    amountbuffer,
    minimalprofit,
    dataTooOld,
    markets,
    profits
}