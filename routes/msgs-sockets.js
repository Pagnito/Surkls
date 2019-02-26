const mongoose = require('mongoose');
const Msgs = require('../database/models/msg-model');
module.exports = (io, app) => {  
  io.on('connection', (socket)=>{
    io.to(socket.id).emit('loggedIn', socket.id)
    socket.on('open-dm', (ids)=>{
      console.log(socket.id)
      let newThread = new Msgs ({
        user1: ids.sender,
        user2: ids.receiver
      })
      /* newThread.save().then((msgs)=>{
        io.to(ids.receiver).emit('dm', msgs.msgs)
      }) */
    })   
  })
}