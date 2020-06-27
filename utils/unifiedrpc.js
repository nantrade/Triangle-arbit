const rpc = {
    binance: require('./binancerpc'),
    bithumb: require('./bithumbrpc'),
    upbit: require('./upbitrpc')
}

async function getSymbols(exchange,inputs){
    exchange = exchange.toLowerCase()
    let bn = await rpc[exchange].getSymbols()
    console.log(bn)
}

async function updCurrentPrices(exchange){
    if (Object.keys(rpc).includes(exchange)){
        return await rpc[exchange].updCurrentPrices()
    }else{
        return 'UNKNOWN EXCHANGE'
    }
}

async function getBalance(exchange,asset){
    if (Object.keys(rpc).includes(exchange)){
        return await rpc[exchange].getBalance(asset)
    }else{
        return 'UNKNOWN EXCHANGE'
    }
}

async function sendMarketOrder(exchange,order){
    if (Object.keys(rpc).includes(exchange)){
        return await rpc[exchange].sendMarketOrder(order)
    }else{
        return 'UNKNOWN EXCHANGE'
    }
}

async function updateExchangeInfo(exchange){
    if (Object.keys(rpc).includes(exchange)){
        return await rpc[exchange].updateExchangeInfo()
    }else{
        return 'UNKNOWN EXCHANGE'
    }
}

async function getTradesHistory(exchange, symbol){
    if (Object.keys(rpc).includes(exchange)){
        return await rpc[exchange].getTradesHistory(symbol)
    }else{
        return 'UNKNOWN EXCHANGE'
    }
}

module.exports = {
    getSymbols,
    updCurrentPrices,
    getBalance,
    sendMarketOrder,
    updateExchangeInfo,
    getTradesHistory
}