const redClient = require('../database/redis')
const User = require('../database/models/user-model');
const Surkl = require('../database/models/surkl-model');

const spliceObj = (obj, keys) =>{
	let spliced = {};
	keys.forEach(k => {
		if(obj[k]){
			spliced[k] = obj[k] 
		}				
	})
		return spliced;
}
module.exports = (io, socket, connectedUsers) => {

/////////////////////////////////////////////////////////////
  socket.on('share-track', (track_id, surkl_id)=>{
    redClient.set('track'+surkl_id, track_id);
    socket.broadcast.to(surkl_id).emit('track', track_id);
    console.log('SHARED', surkl_id, track_id)
  })
  /////////////////////////////////////////////////////////////
  socket.on('get-track', (surkl_id)=>{
    redClient.get('track'+surkl_id,(err,track)=>{
      io.to(socket.id).emit('mounted-track', track)
    });
  })
/////////////////////////////////////////////////////////////
  socket.on('join-surkl-room', (surkl_id) =>{
    socket.join(surkl_id)
    
    redClient.hget('surkls-msgs', surkl_id, (err,msgs)=>{
      if (err) {
        socket.emit('videoChatError');
      } else {
        io.to(socket.id).emit('receive-surkl-msgs', JSON.parse(msgs));
      }
    })
  
    Surkl.findById({_id: surkl_id}).then(surkl=>{
      let online = surkl.members.filter(mem=>{
        return connectedUsers.hasOwnProperty(mem.user_id)
      })
     /*  console.log(online) */
      console.log('//////////')
      console.log(connectedUsers)
      io.to(surkl_id).emit('online-users', online)
    })
   
  })
  /////////////////////////////////////////////////////////////
  socket.on('created-surkl', (surkl, user)=>{
    let msgs = []
    redClient.hset('surkls-msgs', surkl.surkl_id, JSON.stringify(msgs), (err, done) => {
      if (err) {
        io.to(socket.id).emit('videoChatError');
      }
    });
   
  })
  /////////////////////////////////////////////////////////////
  socket.on('surkl-msg', (msg) => {
    redClient.hget('surkls-msgs', msg.surkl_id, (err, msgs) => {
      
      if (err) {
        socket.emit('videoChatError');
      } else if(msgs!==null){       
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
  /////////////////////////////////////////////////////////////
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
  /////////////////////////////////////////////////////////////
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
  /////////////////////////////////////////////////////////////
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
    User.findOneAndUpdate({_id:userToAdd._id}, {
      $push:{notifs: {
          $each:[notif], 
          $position:0
        }
      },
      $inc: {notif_count:1}
    }, {new:true},(err,upNotif)=>{
      if(err)console.log(err)
      io.to(connectedUsers[userToAdd._id].socketId).emit('notif',  upNotif.notifs[0])
    })
     
    
    //Surkl.updateOne({_id: surkl._id}, {$push:userToAdd}).exec()
  })
}