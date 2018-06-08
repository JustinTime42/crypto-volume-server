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

db.select('*')
.from('volume')
.map((row, i, arr) => {
    setTimeout(() => {
        getCoinHist(row.name)       
        if (i === arr - 1) {
            console.log("Updated complete")
            process.exit()
        }
    }, i*1000)

})
.catch(error => console.log(error))

const getCoinHist = (coinSymbol) => {
    const url = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + coinSymbol + "&tsym=BTC&limit=27";
    axios.get(url)
    .then(response => {        
        db('volume')        
        .where('name', '=', coinSymbol)
        .update({  
            meanvol7: getAverage(response.data.Data, 7),
            meanvol14: getAverage(response.data.Data, 14),
            meanvol21: getAverage(response.data.Data, 21),
            meanvol28: getAverage(response.data.Data, 28),
            volume28: response.data.Data[27].volumeto,
            volume27: response.data.Data[26].volumeto,
            volume26: response.data.Data[25].volumeto,
            volume25: response.data.Data[24].volumeto,
            volume24: response.data.Data[23].volumeto,
            volume23: response.data.Data[22].volumeto,
            volume22: response.data.Data[21].volumeto,
            lastupdated: new Date()
        })
        .then(console.log(coinSymbol + " updated volume on " + new Date()))
        .catch(error => console.log(coinSymbol + " volume " + error))

        db('rawvolume')
        .where('coin', '=', coinSymbol)
        .update({
            coin: coinSymbol,
            day0: response.data.Data[27].volumeto,
            daym1: response.data.Data[26].volumeto,
            daym2: response.data.Data[25].volumeto,
            daym3: response.data.Data[24].volumeto,
            daym4: response.data.Data[23].volumeto,
            daym5: response.data.Data[22].volumeto,
            daym6: response.data.Data[21].volumeto,
            daym7: response.data.Data[20].volumeto,
            daym8: response.data.Data[19].volumeto,
            daym9: response.data.Data[18].volumeto,
            daym10: response.data.Data[17].volumeto,
            daym11: response.data.Data[16].volumeto,
            daym12: response.data.Data[15].volumeto,
            daym13: response.data.Data[14].volumeto,
            daym14: response.data.Data[13].volumeto,
            daym15: response.data.Data[12].volumeto,
            daym16: response.data.Data[11].volumeto,
            daym17: response.data.Data[10].volumeto,
            daym18: response.data.Data[9].volumeto,
            daym19: response.data.Data[8].volumeto,
            daym20: response.data.Data[7].volumeto,
            daym21: response.data.Data[6].volumeto,
            daym22: response.data.Data[5].volumeto,
            daym23: response.data.Data[4].volumeto,
            daym24: response.data.Data[3].volumeto,
            daym25: response.data.Data[2].volumeto,
            daym26: response.data.Data[1].volumeto,
            daym27: response.data.Data[0].volumeto,
        })
        .then(console.log(coinSymbol + " updated rawvolume on " + new Date()))
        .catch(error => console.log(coinSymbol + " raw volume " + error))
    })                 
    .catch(error => console.log(error))    
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
            data.slice(-i, -i+7)
        .map(x => x.volumeto)
        .reduce((sum, volume) => sum + volume, 0) 
        / 7
        ) 
    }     
} 