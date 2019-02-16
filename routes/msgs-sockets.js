const Msg = require('../database/models/msg-model');
const mongoose = require('mongoose');
const Msgs = require('../database/models/msg-model');
module.exports = (io) => {  
  io.on('connection', (socket)=>{
    console.log(socket.id)
    socket.on('dm', (msgObj, sendToId )=>{
      console.log(msgObj, sendToId)
      io.to(sendToId).emit()
    })   
  })
}