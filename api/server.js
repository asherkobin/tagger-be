const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const messageRouter = require('./messages/message-router')
// const messageRouter2 = require('./messages/message-router2')
const tagRouter = require('./tags/tag-router')
const googleAuthRouter = require('./auth/google.js')

require('dotenv').config()

const server = express()

//INIT SERVER
server.use(cors())
server.use(helmet())
server.use(express.json())

//ROUTERS

// server.use('/', messageRouter2)
server.use('/googleAuthRouter', googleAuthRouter)
server.use('/', messageRouter)
server.use('/', tagRouter)

//Use server function
server.use(function(req, res, next) {
// place the headers in the server file so it 
//would be universal throught the code
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
    // console.log(res.header)
  }); 

//test default api 
server.get('/', (req, res)=> {
    res.status(200).json({api: 'up'})
})

module.exports = server


