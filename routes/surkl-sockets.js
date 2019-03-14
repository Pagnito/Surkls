const redClient = require('../database/redis')
const User = require('../database/models/user-model');
const Surkl = require('../database/models/surkl-model');
module.exports = (io, socket, connectedUsers) => {


  socket.on('join-surkl-room', (surkl_id) =>{
    socket.join(surkl_id)
  })
  socket.on('created-surkl', (surkl)=>{
    let msgs = []
    redClient.hset('surkls-msgs', surkl.surkl_id, JSON.stringify(msgs), (err, done) => {
      if (err) {
        io.to(socket.id).emit('videoChatError');
      }
    });
  })
  socket.on('fetch-surkl-msgs', (surkl_id)=>{
    redClient.hget('surkls-msgs', surkl_id, (err,msgs)=>{
      if (err) {
        socket.emit('videoChatError');
      } else {
        io.to(surkl_id).emit('receive-surkl-msgs', JSON.parse(msgs));
      }
    })
  })
  socket.on('surkl-msg', (msg) => {
    redClient.hget('surkls-msgs', msg.surkl_id, (err, msgs) => {
      
      if (err) {
        socket.emit('videoChatError');
      } else {
        
        let msgsArr = JSON.parse(msgs);
        if (msgsArr.length > 200) {
          msgsArr = msgsArr.slice(0, 200);
        }
        msgsArr.push(msg);
        redClient.hset('surkls-msgs', msg.surkl_id, JSON.stringify(msgsArr), (err, done) => {
          if (err) {
            io.to(socket.id).emit('videoChatError');
          }
          io.to(msg.surkl_id).emit('receive-surkl-msgs', msgsArr);
        });
      }
     
    });
  });
  socket.on('clear-notifs', (user)=>{
    User.updateOne({_id: user._id}, {$set:{notif_count: 0}}).exec()
  });
  socket.on('clear-all-notifs', (user)=>{
    User.updateOne({_id:user._id},{$set:{notifs:[]}}).exec()
  })
  socket.on('decline-surkl', (notif_id, user_id)=>{
    User.updateOne({_id:user_id}, {
      $pull:{notifs: {_id:notif_id}}
    }).exec()
  })
  socket.on('accept-surkl', (surkl, user)=>{
    let memOf = {
      surkl_id: surkl.source.source_id,
      surkl_name: surkl.source.name
    }
    let userObj = {
      userName:user.userName,
      avatarUrl:user.avatarUrl,
      user_id: user._id
    }
    
    User.updateOne({_id:user._id}, {
      $set:{memberOf:memOf},
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
        adminName: surkl.adminName,
        avatarUrl: surkl.adminAvatar,
        source_id: surkl.surkl_id
      },
      text: surkl.adminName + ' has invited you to join '+surkl.name
    }
    User.updateOne({_id:userToAdd._id}, {
      $push:{notifs: notif},
      $inc: {notif_count:1}
    }).exec()
      io.to(connectedUsers[userToAdd._id].socketId).emit('notif',  notif)
    
    //Surkl.updateOne({_id: surkl._id}, {$push:userToAdd}).exec()
  })
}