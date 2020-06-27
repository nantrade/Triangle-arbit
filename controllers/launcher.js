const rpc = require('../utils/unifiedrpc')
const triangulation = require('../controllers/triangulation')
const arbitrage = require('../controllers/arbitrage')
let { markets,exchanges, exchangesconfig, minimalprofit, baseamount, fees, amountbuffer, profits } = require('../utils/storage')

let updExchangeInfo = false

//reloadBot()

async function reloadBot() {
    try {
        console.log(' ')
        console.log('START >>> >>> >>> >>> >>>')
        let startimmediately = await start()
        console.log('FINISH >>> >>> >>> >>> >>>')
        console.log(' ')
        if (startimmediately){
            reloadBot()
        }else{
            setTimeout(async () => {
                reloadBot()
            }, 1e3)
        }      
    } catch (e) {
      console.log(e)
      setTimeout(() => {
        reloadBot()
      }, 1e3)
    }
}

async function start(){
    let reload = {}
    if (!updExchangeInfo) await updateExchangeInfo()
    let updatedPairs = await updatePrices()

    let exchanges = Object.keys(exchangesconfig)
    let arbiexchanges = []
    await asyncForEach(exchanges,async exchange=>{
        if (updatedPairs[exchange] && updatedPairs[exchange].length > 0){
            if (exchangesconfig[exchange].triangulation){
                reload.t = await tryTriangulation(updatedPairs[exchange],exchange)
            }
        }
        if (exchangesconfig[exchange].arbitrage && !arbiexchanges.includes(exchange)){
            arbiexchanges.push(exchange)
        }
    })

    reload.a = await tryArbitrage(updatedPairs,arbiexchanges)

    if (reload.a || reload.t){
        return true
    }else return false
}

async function tryArbitrage(updatedPairs,exchanges){

    let action = false
    let initbalance = 100
    let asset = 'BTC' 

    let bestAction = await arbitrage.evaluateArbitrageProfit(exchanges,asset,initbalance,updatedPairs)

    console.log('/// ARBITRAGE DONE ')
    return false

}

async function updateExchangeInfo(){
    let exchanges = Object.keys(exchangesconfig)
    await asyncForEach(exchanges,async exchange=>{
        if (exchangesconfig[exchange].data){
            await rpc.updateExchangeInfo(exchange)
        }
    })
    updExchangeInfo = true
}

async function updatePrices(){
    let upd = {}
    let exchanges = Object.keys(exchangesconfig)
    await asyncForEach(exchanges,async exchange=>{
        if (exchangesconfig[exchange].data){
            upd[exchange] = await rpc.updCurrentPrices(exchange)
        }
    })
    console.log(' ->>> ',Object.keys(upd))
    return upd
}

async function tryTriangulation(updatedPairs,exchange){
    let action = false
    let initbalance = 100
    let asset = 'BTC' 

    let bestAction = await triangulation.evaluateTriangulationProfit(exchange,asset,initbalance,updatedPairs)
    console.log(profits)
    console.log('minimal profit: ',minimalprofit)
    console.log('profit: ')
    console.log(bestAction.profit)

    if (bestAction.profit/initbalance > (100+minimalprofit)/100 ){
        console.log('profitable action')
        let result = await executeChainTransactions(exchange,bestAction.txs)
        if (result.final){
            console.log('initial amount: ',result.init)
            console.log('final   amount: ',result.final)
            console.log('predicted profit: ',bestAction.profit / initbalance)
            console.log('realized  profit: ',result.final / result.init )
            if (result.final >= result.init){
                profits.realized.success++
                action = true
            } else {
                profits.realized.failure++
                if (profits.realized.failure % 5 > 1) minimalprofit += 0.01
            }
            if (result.final / result.init >= bestAction.profit / initbalance){
                profits.prediction.success++
            } else {
                profits.prediction.failure++
            }

        }else{
            profits.error ={msg: ' UNHANDLED ERROR ',data: result.final}
            console.log(' TRANSACTION FATAL FAILURE')
        }
        //action = true
        console.log(" DO IT ONLY WHEN PROFIT > 1 -> change line  64 ")
    }else if (bestAction.profit/initbalance > 1) profits.toosmall++

    return action
}

async function executeChainTransactions(exchange,txs){
    // create x transactions -> execute next after confirmation of previous + randomized interval
    
    //let txamount = await getTxAmount(exchange,txs,asset)
    let amountsymbol = txs[0].quotecoin + 'USDT'
    console.log(amountsymbol)
    if (amountsymbol == 'USDTUSDT'){
        txamount = baseamount
    }else{
        if (Object.keys(markets).includes(amountsymbol)){
            console.log(markets[amountsymbol][exchange].price)
            txamount = baseamount / markets[amountsymbol][exchange].price
        }else{
            console.log(' USDT PRICE NOT FOUND FOR '+amountsymbol)
            let btcprice = txs[0].quotecoin + 'BTC'
            if (Object.keys(markets).includes(btcprice)){
                console.log(markets[btcprice][exchange].price)
                txamount = baseamount / markets[btcprice][exchange].price / markets['BTCUSDT'][exchange].price
            }else{
                console.log(' COULD NOT SET TX AMOUNT')
                return {init: initamount, final: false}
            }
        }
    }

    let initamount
    if (txs[0].entrycoin == txs[0].quotecoin){
        initamount = txamount
    }else {
        initamount = txamount / txs[0].price
    }
    
    console.log('amount: '+txamount)
    console.log(txs)
    //console.log(markets[txs[0].symbol].binance)

    let result = await sendSoftMarketOrderList(exchange,txs,txamount)

    return {init: initamount, final: result}
    
}

async function sendSoftMarketOrderList(exchange,txs,txamount){

    // send market order 1 
    
    let order = {
        symbol: txs[0].symbol,
        amount: txamount
    }

    if (txs[0].entrycoin == txs[0].quotecoin){
        order.buy = false
    }else{
        order.buy = true
    }
    
    console.log('////  ',order)
    let response = await rpc.sendMarketOrder(exchange,order)
    //console.log(response)

    if (!response.success){
        if (response.zeroamount){
            //console.log(' + transaction zeroamount ')
            order.amount = 2 * response.minNotional.minNotional / markets[order.symbol][exchange].price
            order.amount = Math.floor(order.amount/response.lotSize.stepSize +1)*response.lotSize.stepSize
            console.log(' + min amount '+order.amount)
            return await sendSoftMarketOrderList(exchange,txs,order.amount)
        }else if (response.msg == 'binance Account has insufficient balance for requested action.'){
            order.amount -= response.lotSize.stepSize*2
            return await sendSoftMarketOrderList(exchange,txs,order.amount)
        }else{
            console.log(' transaction failed RESTORE BALANCES MANUALLY')
            return false
        }
    }else {
        order.amount = order.amount * (1-fees[exchange] - amountbuffer)
        order.amount = response.data.executedQty 
        if (txs[0].quotecoin != txs[0].exitcoin) order.amount = order.amount * markets[txs[0].symbol][exchange].price
        if (txs.length > 1){
            if (txs[0].exitcoin != txs[1].quotecoin){
                order.amount = order.amount / markets[txs[1].symbol][exchange].price
            }
            txs.splice(0,1)
            return await sendSoftMarketOrderList(exchange,txs,order.amount)
        }else return order.amount
    }
    
}

async function getTxAmount(exchange,txs,asset){
    let trs = JSON.parse(JSON.stringify(txs))
    let balance = await rpc.getBalance(exchange,asset)
    let maxallowedamount = getMaxAllowedAmount(exchange,asset,trs)

    let txamount
    if (balance > maxallowedamount){
        txamount = maxallowedamount
    }else{
        txamount = balance
    }
    return txamount
}


function getMaxAllowedAmount(exchange,asset,txs){
    let maxamount
    let assetamount
    let amount
    let conversionrate = 1
    while (txs.length > 0){
        if (txs[0].entrycoin == asset){
            if (txs[0].basecoin == asset){
                conversionrate = conversionrate * markets[txs[0].symbol][exchange].askPrice
                amount = markets[txs[0].symbol][exchange].askQty
            }

            if (txs[0].quotecoin == asset){
                conversionrate = conversionrate / markets[txs[0].symbol][exchange].bidPrice
                amount = markets[txs[0].symbol][exchange].bidQty
            }
            
            assetamount = amount*conversionrate

            if (maxamount == undefined) maxamount = assetamount
            if (assetamount < maxamount){
                maxamount = assetamount
            }
            asset = txs[0].exitcoin
            txs.shift()
        }else{
            txs.push(txs[0])
            txs.shift()
        }
    }
    return maxamount
}


async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }


  module.exports = {
      reloadBot
  }