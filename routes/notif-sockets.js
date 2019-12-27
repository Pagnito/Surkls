const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const User = require('../database/models/user-model');

//const redClient = require('../database/redis');


module.exports = (io, socket, connectedUsers) => {
  socket.on('delete-notif',(user_id, notif)=>{
    User.findByIdAndUpdate(
      {_id:user_id}, 
      {$pull: 
      {notifs: {_id: notif._id}}},
      {new: true}
      ).then(result=>{
        console.log(result)
      })
    sokcket.io()
  })
}