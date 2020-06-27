const keys = require('../apikeys')
const rpc = require('ccxt')
const upbit = new rpc.upbit(keys.upbit)
let { markets,commoncoins } = require('../utils/storage')

async function testConnection(){

}

async function updCurrentPrices(){
    //console.log(upbitFunctions('public'))
    let now = Date.now()
    let upds = []
    let pairs = []
    Object.keys(markets).forEach(market=>{
        if (Object.keys(markets[market]).includes('upbit')){
            pairs.push( markets[market].basecoin+'-'+markets[market].quotecoin )
        }
    })
    //console.log(pairs)
    
    await asyncForEach(pairs, async upbitpair=>{
        if (upbitpair.toUpperCase() == upbitpair){
            upbitpair = await upbit.publicGetOrderbook({markets: upbitpair})
            upbitpair = upbitpair[0]
            upbitpair = {
                symbol: upbitpair.market,
                askPrice: upbitpair.orderbook_units[0]['ask_price'],
                askQty: upbitpair.orderbook_units[0]['ask_size'],
                bidPrice: upbitpair.orderbook_units[0]['bid_price'],
                bidQty: upbitpair.orderbook_units[0]['bid_size'],
            }
            upbitpair.symbol = upbitpair.symbol.split('-')
            upbitpair.symbol = upbitpair.symbol[1] + upbitpair.symbol[0]
            //console.log(upbitpair)
            commoncoins.forEach(coin=>{
                let symbol = upbitpair.symbol 
                let splitt = symbol.split(coin)
                if (splitt.length == 2){
                    console.log(' + '+symbol)
                    if (!Object.keys(markets).includes(symbol)){
                        markets[symbol] = {symbol: symbol}
                    }
                    if (!Object.keys(markets[symbol]).includes('upbit')){
                        markets[symbol]['upbit'] = {}
                    }
                    if (
                        markets[symbol]['upbit']['askPrice'] != upbitpair.askPrice || markets[symbol]['upbit']['bidPrice'] != upbitpair.bidPrice ||
                        markets[symbol]['upbit']['askQty'] != upbitpair.askQty || markets[symbol]['upbit']['bidQty'] != upbitpair.bidQty
                        ){
                        markets[symbol]['upbit']['askPrice'] = upbitpair.askPrice
                        markets[symbol]['upbit']['askQty'] = upbitpair.askQty
                        markets[symbol]['upbit']['bidPrice'] = upbitpair.bidPrice
                        markets[symbol]['upbit']['bidQty'] = upbitpair.bidQty

                        markets[symbol]['upbit']['price'] = upbitpair.bidPrice
                        upds.push(symbol)
                    }
                    
                    markets[symbol]['upbit']['updated'] = now
                    if (splitt[0].length > 1){
                        markets[symbol]['quotecoin'] = splitt[0]
                        markets[symbol]['basecoin'] = coin
                    }else{
                        markets[symbol]['quotecoin'] = coin
                        markets[symbol]['basecoin'] = splitt[1]
                    }
                    //console.log(markets[symbol])
                }
            })
        }
    })
    return upds
}

async function getSymbols(exchange,inputs){

    Object.keys(upbit).forEach(method=>{
        console.log(method)
    })
    let bn = await upbit.publicGetExchangeInfo()
    console.log(bn.symbols.length,bn.symbols[0]['symbol'])
    let bh = await upbit.publicGetTickerAll()
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
    let precision = markets[order.symbol].upbit.baseAssetPrecision
    let filters = markets[order.symbol].upbit.filters
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
    order.price = markets[order.symbol].upbit.price


    //console.log(upbitFunctions('private'))
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
            receipt = await upbit.privatePostOrder(bnorder)
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
    let balances = await upbit.privateGetAccount()
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
    
    //console.log(upbitFunctions('public'))

    let res = await upbit.publicGetMarketAll()
    //console.log(res)
    res.forEach(symbol=>{
        symbol.symbol = symbol.market.split('-')
        symbol.quotecoin = symbol.symbol[1]
        symbol.basecoin = symbol.symbol[0]
        symbol.symbol = symbol.symbol[1] + symbol.symbol[0]
        //console.log(symbol)
        if ( markets[symbol.symbol] == undefined ){
            markets[symbol.symbol] = {
                symbol: symbol.symbol,
                basecoin: symbol.basecoin,
                quotecoin: symbol.quotecoin
            }
        }
        if (!Object.keys(markets[symbol.symbol]).includes('upbit')){
            markets[symbol.symbol]['upbit'] = symbol
        }

    })

    if (res.symbols){
        return true
    }else{
        return false
    }
}

function upbitFunctions(filter){
    Object.keys(upbit).forEach(param=>{
        if (param.includes(filter)) console.log(param)
    })
}


async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}

async function getTradesHistory(symbol){
    let res
    let mytrades = []
    //console.log(upbitFunctions('private'))
/*
    markets = {
        'BTCKRW': {
            basecoin: 'KRW',
            quotecoin: 'BTC',
            upbit: {}
        }
    }
*/
        console.log(symbol)
        if (Object.keys(markets[symbol]).includes('upbit')){
            res = await upbit.privateGetOrders()
            console.log(res)
            res.forEach(trade=>{
                mytrades.push(
                    {
                        symbol: symbol,
                        id: trade.id,
                        price: trade.price,
                        amount: trade.qty,
                        buy: trade.isBuyer
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