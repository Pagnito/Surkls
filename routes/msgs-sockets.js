const Msg = require('../database/models/msg-model');
const mongoose = require('mongoose');
const redClient = require('../database/redis');
module.exports = (io, app) => {
  app.get('/api/connect', (req,res)=>{
    console.log('bruuuuh')
    io.on('connection', ()=>{
      console.log('bruuuuh')
      res.end()
    })
  }) 
}