const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const testRouter = require('./messages/message-router2')
const messageRouter = require('./messages/message-router2')


require('dotenv').config()


const server = express()

//INIT SERVER
server.use(cors())
server.use(helmet())
server.use(express.json())


//ROUTERS

// server.use('/')
server.use('/test', testRouter)
server.use('/', messageRouter)

server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  }); 

server.get('/', (req, res)=> {
    res.status(200).json({api: 'up'})
})

module.exports = server


