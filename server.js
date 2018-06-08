const express = require('express')
const bodyParser = require('body-parser')
const knex = require('knex')
const pg = require('pg')
const cors = require('cors')


const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    }    
})

const app = express();

app.use(cors())

app.get('/', (req, res) => { 
   
    db.select('*').from('volume')
    .then(data => {
        res.json(data)
    })
       
})

app.get('/rawvolume', (req, res) => { 
   
    db.select('*').from('rawvolume')
    .then(data => {
        res.json(data)
    })       
})

app.get('/deltav', (req, res) => { 

    db.from('deltavma')
    .innerJoin('rawvolume', 'deltavma.coin', 'rawvolume.coin')
    .innerJoin('volume', 'volume.name', 'rawvolume.coin')
    .where('deltama', '>', 0)
    .andWhere('deltama', '<', 10000)
    .andWhere('meanvol7', '>', 1)
    .orderBy('deltama', 'desc')
    .limit(5)
    .then(data => {
        res.json(data)
    })       
})

app.listen(process.env.PORT);

