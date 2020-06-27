const keys = require('../apikeys')
const rpc = require('ccxt')
const binance = new rpc.binance(keys.binance)
let { markets,commoncoins } = require('../utils/storage')


async function testConnection(){

}

async function updCurrentPrices(){
    let now = Date.now()
    let upds = []
    let prices = await binance.publicGetTickerBookTicker()
    prices.forEach(binancepair=>{
        commoncoins.forEach(coin=>{
            let symbol = binancepair.symbol
            let splitt = symbol.split(coin)
            if (splitt.length == 2){
                if (!Object.keys(markets).includes(symbol)){
                    markets[symbol] = {symbol: symbol}
                }
                if (!Object.keys(markets[symbol]).includes('binance')){
                    markets[symbol]['binance'] = {}
                }
                if (
                    markets[symbol]['binance']['askPrice'] != binancepair.askPrice || markets[symbol]['binance']['bidPrice'] != binancepair.bidPrice ||
                    markets[symbol]['binance']['askQty'] != binancepair.askQty || markets[symbol]['binance']['bidQty'] != binancepair.bidQty
                    ){
                    markets[symbol]['binance']['askPrice'] = binancepair.askPrice
                    markets[symbol]['binance']['askQty'] = binancepair.askQty
                    markets[symbol]['binance']['bidPrice'] = binancepair.bidPrice
                    markets[symbol]['binance']['bidQty'] = binancepair.bidQty

                    markets[symbol]['binance']['price'] = binancepair.bidPrice
                    upds.push(symbol)
                }
                
                markets[symbol]['binance']['updated'] = now
                if (splitt[0].length > 1){
                    markets[symbol]['quotecoin'] = splitt[0]
                    markets[symbol]['basecoin'] = coin
                }else{
                    markets[symbol]['quotecoin'] = coin
                    markets[symbol]['basecoin'] = splitt[1]
                }
            }
        })
    })
    return upds
}

async function getSymbols(exchange,inputs){

    let bn = await rpc['binance'].publicGetExchangeInfo()
    console.log(bn.symbols.length,bn.symbols[0]['symbol'])
    let bh = await bithumb.publicGetTickerAll()
    console.log(Object.keys(bh.data).length,Object.keys(bh.data)[0])
    let ub = await upbit.publicGetMarketAll()
    console.log(ub.length,ub[0]['market'])
}
/*
sendMarketOrder({
    symbol: 'BTCUSDT',
    amount: 0.199999999999999,
    buy: true
})
 */
async function sendMarketOrder(order){
    let precision = markets[order.symbol].binance.baseAssetPrecision
    let filters = markets[order.symbol].binance.filters
    let lotsize = false
    let minnotional = false
    let i=0
    if (filters.length > 0){
        while (!lotsize || !minnotional){
            if (filters[i].filterType == 'LOT_SIZE'){
                lotsize = {
                    minQty: parseFloat(filters[i].minQty),
                    stepSize: parseFloat(filters[i].stepSize)
                }
            }
            if (filters[i].filterType == 'MIN_NOTIONAL'){
                minnotional = {
                    minNotional: parseFloat(filters[i].minNotional),
                    applyToMarket: parseFloat(filters[i].applyToMarket)
                }
            }
            if (i == filters.length - 1) {
                if (!lotsize) lotsize = true
                if (!minnotional) minnotional = true
            }
            i++
        }
    }

    //console.log(lotsize,minnotional)
    if (lotsize == true) lotsize = {minQty: 0.00000001, stepSize: 0.00000001}
    if (minnotional == true) minnotional = { minNotional: 0.00000001, applyToMarket: true}
    order.price = markets[order.symbol].binance.price


    //console.log(binanceFunctions('private'))
    //console.log(' + raw amount '+order.amount)
    //console.log(' + lot step size '+lotsize.stepSize)
    order.amount = Math.floor(order.amount/lotsize.stepSize)*lotsize.stepSize
    //console.log(order)

    if (order.amount < lotsize.minQty || order.amount*order.price < minnotional.minNotional){
        // ORDER AMOUNT TOO TINY -> LONG TERM WITH DEPTH CONTROL OR 
        // HARD ASSIGNED MIN NOTIONAL AND ADJUSTING PROFIT % SWITCH
        return {
            success: false, 
            zeroamount: true, 
            minNotional: minnotional, 
            lotSize: lotsize
        }
    }else{
        //console.log(' + Normalized success')
        let bnorder = {
            symbol: order.symbol,
            type: 'MARKET',
            quantity: parseFloat(order.amount).toFixed(precision),
            timestamp: Date.now()
        }
        if (order.buy) {
            bnorder.side = 'BUY' 
        }else{
            bnorder.side = 'SELL'
        }

        //console.log(bnorder)
        try {
            receipt = await binance.privatePostOrder(bnorder)
            //console.log(' + bn receipt ',receipt)
            return {
                success: true, 
                data: receipt 
            }
        }catch(e){
            console.log(e.message)
            return {
                success: false,
                msg: e.message, 
                minNotional: minnotional, 
                lotSize: lotsize
            }
        }
        
        //    console.dir(balances)
    }

}

async function getBalance(asset){
    let cntr = 0
    let balances = await binance.privateGetAccount()
    balances = balances.balances
    while (cntr < balances.length){
        if (balances[cntr].asset == asset){
            return parseFloat(balances[cntr].free)
        } 
        cntr++
    }
    return false
}

async function updateExchangeInfo(){
    
    let res = await binance.publicGetExchangeInfo()
    //console.log(res.symbols[0])
    //console.log(Object.keys(res))
    res.symbols.forEach(symbol=>{

        if ( markets[symbol.symbol] == undefined ){
            markets[symbol.symbol] = {symbol: symbol.symbol}
        }
        if (!Object.keys(markets[symbol.symbol]).includes('binance')){
            markets[symbol.symbol]['binance'] = symbol
        }

    })

    if (res.symbols){
        return true
    }else{
        return false
    }
}

async function getTradesHistory(symbol){
    let res
    let mytrades = []
    //console.log(binanceFunctions('private'))

    //markets = {        'BTCUSDT': true    }

        //console.log(markets[symbol])
        if (Object.keys(markets[symbol]).includes('binance')){
            res = await binance.privateGetMyTrades({symbol: symbol})
            
            
            
            
            
            //console.log(res[0])
            res.forEach(trade=>{
                mytrades.push(
                    {
                        symbol: symbol,
                        id: trade.id,
                        price: trade.price,
                        amount: trade.qty,
                        buy: trade.isBuyer,
                        timestamp: trade.time
                    }
                )
            })
        }else{
            return []
        }
        //console.log(res.length)
    //console.log(res[0])
    //console.log(mytrades[0])
    return mytrades
}

function binanceFunctions(filter){
    Object.keys(binance).forEach(param=>{
        if (param.includes(filter)) console.log(param)
    })
}


async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}


module.exports = {
    updateExchangeInfo,
    updCurrentPrices,
    testConnection,
    getSymbols,
    getBalance,
    sendMarketOrder,
    getTradesHistory
}