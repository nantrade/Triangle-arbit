const keys = require('../apikeys')
const rpc = require('ccxt')
const bithumb = new rpc.bithumb(keys.bithumb)
let { markets,commoncoins } = require('../utils/storage')


async function testConnection(){

}

async function updCurrentPrices(){
    //console.log(bithumbFunctions('public'))
    let now = Date.now()
    let upds = []
    let prices = await bithumb.publicGetOrderbookAll()
    //console.log(Object.keys(prices.data))
    Object.keys(prices.data).forEach(bithumbpair=>{
        if (bithumbpair.toUpperCase() == bithumbpair){
            //console.log(prices.data[bithumbpair])
            bithumbpair = prices.data[bithumbpair]
            bithumbpair = {
                symbol: bithumbpair.order_currency + prices.data.payment_currency,
                askPrice: bithumbpair.asks[0]['price'],
                askQty: bithumbpair.asks[0]['quantity'],
                bidPrice: bithumbpair.bids[4]['price'],
                bidQty: bithumbpair.bids[4]['quantity']
            }
            commoncoins.forEach(coin=>{
                let symbol = bithumbpair.symbol 
                let splitt = symbol.split(coin)
                if (splitt.length == 2){
                    if (!Object.keys(markets).includes(symbol)){
                        markets[symbol] = {symbol: symbol}
                    }
                    if (!Object.keys(markets[symbol]).includes('bithumb')){
                        markets[symbol]['bithumb'] = {}
                    }
                    if (
                        markets[symbol]['bithumb']['askPrice'] != bithumbpair.askPrice || markets[symbol]['bithumb']['bidPrice'] != bithumbpair.bidPrice ||
                        markets[symbol]['bithumb']['askQty'] != bithumbpair.askQty || markets[symbol]['bithumb']['bidQty'] != bithumbpair.bidQty
                        ){
                        markets[symbol]['bithumb']['askPrice'] = bithumbpair.askPrice
                        markets[symbol]['bithumb']['askQty'] = bithumbpair.askQty
                        markets[symbol]['bithumb']['bidPrice'] = bithumbpair.bidPrice
                        markets[symbol]['bithumb']['bidQty'] = bithumbpair.bidQty

                        markets[symbol]['bithumb']['price'] = bithumbpair.bidPrice
                        upds.push(symbol)
                    }
                    
                    markets[symbol]['bithumb']['updated'] = now
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

    Object.keys(bithumb).forEach(method=>{
        console.log(method)
    })
    let bn = await bithumb.publicGetExchangeInfo()
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
    let precision = markets[order.symbol].bithumb.baseAssetPrecision
    let filters = markets[order.symbol].bithumb.filters
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
    order.price = markets[order.symbol].bithumb.price


    //console.log(bithumbFunctions('private'))
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
            receipt = await bithumb.privatePostOrder(bnorder)
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
    let balances = await bithumb.privateGetAccount()
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
    
    let res = await bithumb.publicGetTickerAll()
    
    Object.keys(res.data).forEach(coin=>{
        if (coin != 'date'){
            if ( markets[coin+'KRW'] == undefined ){
                markets[coin+'KRW'] = {symbol: coin+'KRW'}
            }
            if (!Object.keys(markets[coin+'KRW']).includes('bithumb')){
                markets[coin+'KRW']['bithumb'] = res.data[coin]
            }
        }
        
    })

    if (res.data){
        return true
    }else{
        return false
    }
}

function bithumbFunctions(filter){
    Object.keys(bithumb).forEach(param=>{
        if (param.includes(filter)) console.log(' * ',param)
    })
}

async function getTradesHistory(symbol){
    let res
    let mytrades = []
    //console.log(bithumbFunctions('private'))

    /*
    markets = {
        'BTCKRW': {
            basecoin: 'KRW',
            quotecoin: 'BTC',
            bithumb: {}
        }
    }
    */

        console.log(symbol)
        if (Object.keys(markets[symbol]).includes('bithumb')){
            res = await bithumb.privatePostInfoUserTransactions(
                {
                    order_currency: markets[symbol].quotecoin,
                    payment_currency: markets[symbol].basecoin
                }
            )
            console.log(res.data[0])
            res.data.forEach(trade=>{
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