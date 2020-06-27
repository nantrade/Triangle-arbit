let now = Date.now()

let { markets, fees, dataTooOld} = require('../utils/storage')


function evaluateTriangulationProfit(exchange,asset,initbalance,updated){
    now = Date.now()
    asset = asset.toUpperCase()
    exchange = exchange.toLowerCase()

    let entryPrices
    let middlePrices
    let exitPrices
    let profits = []

    console.log(initbalance,asset)
    entryPrices = getPrices(exchange,asset,undefined,[],updated)
    //console.log(entryPrices)
    entryPrices.forEach(entrypair=>{
        exitPrices = getPrices(exchange,undefined,asset,[entrypair.symbol],updated)
        //console.log(exitPrices)
        exitPrices.forEach(exitpair=>{
            middlePrices = getPrices(exchange,entrypair.exitcoin,exitpair.entrycoin,[],updated)
            //console.log(middlePrices)
            middlePrices.forEach(middlepair=>{
                //console.log(initbalance,entrypair.price,middlepair.price,exitpair.price,fees[exchange])
                entrypair.exitamount = entrypair.price*initbalance*(1-fees[exchange])
                middlepair.exitamount = middlepair.price*entrypair.exitamount*(1-fees[exchange])
                exitpair.exitamount = exitpair.price*middlepair.exitamount*(1-fees[exchange])
                profits.push({
                    profit: initbalance*entrypair.price*middlepair.price*exitpair.price*(1-fees[exchange])*(1-fees[exchange])*(1-fees[exchange]),
                    txs: [
                        entrypair,
                        middlepair,
                        exitpair 
                    ]
                })
            })
        })
    })
    let maxprofit = {profit:0}
    profits.forEach(evaluation=>{
        if (maxprofit.profit == 0){
            maxprofit = evaluation
        }
        if (evaluation.profit > maxprofit.profit){
            //if (evaluation.profit/maxprofit.profit < 1.1)
            maxprofit = evaluation
        }            
    })

    //console.log(maxprofit)
    //console.log(exchange,initbalance,maxprofit.profit)
    return maxprofit
}

function getPrices(exchange,entrycoin,exitcoin,excluded,updated){
    let prices = []
    let timeok = false
    let entrycoinok = false
    let exitcoinok = false
    //console.log(exchange,entrycoin,exitcoin,excluded)
    updated.forEach(symbol => {
        if (!excluded.includes(symbol) && entrycoin != exitcoin){
            timeok = timestampValidation(now, markets[symbol][exchange].updated)
            entrycoinok = getCoinPosition(entrycoin,markets[symbol])
            exitcoinok = getCoinPosition(exitcoin,markets[symbol])
                //console.log(timeok,entrycoinok,exitcoinok,markets[symbol])
                
            if (timeok && entrycoinok && exitcoinok){
                //console.log('all good')
                if (entrycoinok.basecoin || exitcoinok.quotecoin){
                    let convertionprice
                    if (markets[symbol][exchange].askPrice == 0){
                        convertionprice = 0
                    } else {
                        convertionprice = 1/markets[symbol][exchange].askPrice
                    }
                        
                    prices.push({
                        symbol: markets[symbol]['symbol'],
                        basecoin: markets[symbol]['basecoin'],
                        quotecoin: markets[symbol]['quotecoin'],
                        entrycoin: markets[symbol]['basecoin'],
                        exitcoin: markets[symbol]['quotecoin'],
                        price: convertionprice
                    })
                }else if (entrycoinok.quotecoin || exitcoinok.basecoin){
                    prices.push({
                        symbol: markets[symbol]['symbol'],
                        basecoin: markets[symbol]['basecoin'],
                        quotecoin: markets[symbol]['quotecoin'],
                        entrycoin: markets[symbol]['quotecoin'],
                        exitcoin: markets[symbol]['basecoin'],
                        price: markets[symbol][exchange].bidPrice
                    })
                }
            }/*
            if (timeok){
                if (entrycoin == markets[symbol]['basecoin'] || exitcoin == markets[symbol]['quotecoin']){
                    prices.push({
                        symbol: markets[symbol]['symbol'],
                        basecoin: markets[symbol]['basecoin'],
                        quotecoin: markets[symbol]['quotecoin'],
                        entrycoin: markets[symbol]['basecoin'],
                        exitcoin: markets[symbol]['quotecoin'],
                        price: 1/markets[symbol][exchange].price
                    })
                }else if (entrycoin == markets[symbol]['quotecoin'] || exitcoin == markets[symbol]['basecoin']){
                    prices.push({
                        symbol: markets[symbol]['symbol'],
                        basecoin: markets[symbol]['basecoin'],
                        quotecoin: markets[symbol]['quotecoin'],
                        entrycoin: markets[symbol]['quotecoin'],
                        exitcoin: markets[symbol]['basecoin'],
                        price: markets[symbol][exchange].price
                    })
                }                
            }  */
        }
        
    })
    return prices
}

function timestampValidation(now, timestamp){
    if (now - timestamp > dataTooOld){
        return false
    }else{
        return true
    }
}

function getCoinPosition(coin,pair){
    if (coin && pair.quotecoin == coin){
        return {quotecoin: true, basecoin: false}
    }    
    if (coin && pair.basecoin == coin){
        return {quotecoin: false, basecoin: true}
    }
    if (coin){
        return false
    }else{
        return true
    }
}

module.exports = {
    evaluateTriangulationProfit
}