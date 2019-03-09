const redClient = require('../database/redis')
const User = require('../database/models/user-model');
const Surkl = require('../database/models/surkl-model');
module.exports = (io, socket, connectedUsers) => {

  socket.on('clear-notifs', (user)=>{
    User.updateOne({_id: user._id}, {$set:{notif_count: 0}}).exec()
  });
  socket.on('clear-all-notifs', (user)=>{
    User.updateOne({_id:user._id},{$set:{notifs:[]}}).exec()
  })
  socket.on('accept-surkl', (surkl, user)=>{
    console.log(surkl)
    let userObj = {
      userName:user.userName,
      avatarUrl:user.avatarUrl,
      user_id: user._id
    }
    User.updateOne({_id:user._id}, {
      $set:{memberOf:surkl.source.source_id},
      $pull:{notifs: {_id:surkl._id}}
    }).exec()
    Surkl.updateOne({_id:surkl.source.source_id}, 
      {$push:{members:userObj,memberIds: userObj.user_id}}).exec()
  })
  socket.on('add-to-surkl', (userToAdd, surkl)=>{
    delete userToAdd.dms
    delete userToAdd.followers
    delete userToAdd.following
    delete userToAdd.mySurkl
    let notif = {
      notifType: 'add-to-surkl',
      source: {
        name: surkl.name,
        source_id: surkl.surkl_id
      },
      text: surkl.admin + ' has invited you to join '+surkl.name
    }
    console.log(userToAdd)
    User.updateOne({_id:userToAdd._id}, {
      $push:{notifs: notif},
      $inc: {notif_count:1}
    }).exec()
      io.to(connectedUsers[userToAdd.user_id]).emit('notif',  notif)
    
    //Surkl.updateOne({_id: surkl._id}, {$push:userToAdd}).exec()
  })
}