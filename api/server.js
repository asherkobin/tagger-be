const express = require('express')
const cors = require('cors')
const helmet = require('helmet')


require('dotenv').config()

//IMPORT DEFAULT ROUTES
// const primaryRouter = require('../api/messages')
// const userRouter = require('../api/')

const server = express()

//INIT SERVER
server.use(cors())
server.use(helmet())
server.use(express.json())
// server.use(express.urlencoded());
// server.use(express.multipart());

//INIT SERVER
server.use(cors)

//ROUTERS

// server.use('/')

server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  }); 

server.get('/', (req, res)=> {
    res.status(200).json({api: 'up'})
})

module.exports = server