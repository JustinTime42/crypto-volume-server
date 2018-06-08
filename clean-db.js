const axios = require('axios')
const knex = require('knex')
const pg = require('pg')

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    }
})

db('volume')            
.where('meanvol7', '<', '.1')
.del()
.then(console.log)
.catch(error => console.log(error))
  

axios.get("https://min-api.cryptocompare.com/data/all/coinlist")
.then(response => { 
    // This doesn't do anything for now, but will be useful later
    // Object.entries(response.data.Data).forEach((coin, value) => {

    //     db('coinlist').insert({    
    //         name: coin[1].Name,
    //         symbol: coin[1].Symbol,
    //         algorithm: coin[1].Algorithm,
    //         prooftype: coin[1].ProofType,
    //     }).catch(error => console.log(error.detail))
    //  })

     Object.entries(response.data.Data).forEach((coin, i) => {
        setTimeout(() => {
            getCoinsHist(coin[1].Symbol)            
        }, i*1000);
     })
     
})

const getCoinsHist = (coinSymbol) => {
    const url = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + coinSymbol + "&tsym=BTC&limit=27";
    axios.get(url)
    .then(response => {
        let data = response.data.Data
        let volumeObj = 
            {        
                name: coinSymbol,
                meanvol7: getAverage(data, 7),
                meanvol14: getAverage(data, 14),
                meanvol21: getAverage(data, 21),
                meanvol28: getAverage(data, 28),
                volume28: data[27].volumeto,
                volume27: data[26].volumeto,
                volume26: data[25].volumeto,
                volume25: data[24].volumeto,
                volume24: data[23].volumeto,
                volume23: data[22].volumeto,
                volume22: data[21].volumeto,
                lastupdated: new Date()
            }
        let rawVolumeObj = 
            {
                coin: coinSymbol,
                day0: data[27].volumeto,
                daym1: data[26].volumeto,
                daym2: data[25].volumeto,
                daym3: data[24].volumeto,
                daym4: data[23].volumeto,
                daym5: data[22].volumeto,
                daym6: data[21].volumeto,
                daym7: data[20].volumeto,
                daym8: data[19].volumeto,
                daym9: data[18].volumeto,
                daym10: data[17].volumeto,
                daym11: data[16].volumeto,
                daym12: data[15].volumeto,
                daym13: data[14].volumeto,
                daym14: data[13].volumeto,
                daym15: data[12].volumeto,
                daym16: data[11].volumeto,
                daym17: data[10].volumeto,
                daym18: data[9].volumeto,
                daym19: data[8].volumeto,
                daym20: data[7].volumeto,
                daym21: data[6].volumeto,
                daym22: data[5].volumeto,
                daym23: data[4].volumeto,
                daym24: data[3].volumeto,
                daym25: data[2].volumeto,
                daym26: data[1].volumeto,
                daym27: data[0].volumeto,
            }
        let deltaObj = 
            {
            coin: coinSymbol,
            deltama: getDelta(data),
            }
        
        if (getAverage(data, 7) >= .1) {       
            db('volume')
            .returning('name')
            .insert(volumeObj)
            .catch(error => console.log(error.detail))
            .then(name => {
                if (name) {
                    console.log(name + ' added to volume')
                }
            })
            db('rawvolume')
            .returning('coin')
            .insert(rawVolumeObj)
            .catch(error => console.log(error.detail))
            .then(name => {
                console.log(response.data.Data[27].volumeto)
                if (name) {
                    console.log(name + ' added to raw volume')
                }
            })
            db('deltavma')
            .returning('coin')
            .insert(deltaObj)
            .catch(error => console.log(error.detail))
            .then(name => {
                if (name) {
                    console.log(name + ' added to raw volume')
                }
            })
        }
    }).catch(error => console.log(error))
}

const getAverage = (data, i) => {
    if (i === 7) {
        return (
            data.slice(-i)
            .map(x => x.volumeto)
            .reduce((sum, volume) => sum + volume, 0) 
            / 7
        )
    } else {
        return (
            //console.log(data.slice(-i, -i+7))
            data.slice(-i, -i+7)
        .map(x => x.volumeto)
        .reduce((sum, volume) => sum + volume, 0) 
        / 7
        ) 
    }     
} 

const getDelta = (data) => {

    let nineMa = data.map(coin => coin.volumeto).slice(19).reduce((i, j) => i + j) / 9   
    let previous9ma = data.map(coin => coin.volumeto).slice(10, 19).reduce((i, j) => i + j) / 9
    return (nineMa - previous9ma) / previous9ma   
}