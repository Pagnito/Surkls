const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Msgs = require('../database/models/msg-model');
const User = require('../database/models/user-model');
//const redClient = require('../database/redis');
let connectedUsers = {};
let vidSessionUsers = {};
let msgs = {};
module.exports = (io, socket, app) => {
  

  socket.on('setup-vid-dms', (user)=>{
    if(user!==null){
      user.socketId = socket.id;
      vidSessionUsers[user._id] = user;  
      socket.emit('setup-vid-dms', vidSessionUsers)
    }   
  })

  socket.on('setup', (user)=>{
    user.socketId = socket.id;
    connectedUsers[user._id] = user;
  })


  
  socket.on('msg', msg=>{
    if(msg._id!==undefined){
      Msgs.updateOne({_id:msg._id}, {$push:{msgs:msg}},{new:true}).then(up=>{
        let rec = connectedUsers[msg.receiver._id]
          if(rec){
            io.to(rec.socketId).emit('msg', msg)
            io.to(socket.id).emit('msg', msg)
          } else {
            io.to(socket.id).emit('msg', msg)
          }
      })
    } else {
      let msgSchema = {
        msg: msg.msg,
        userName: msg.userName,
        avatarUrl:msg.avatarUrl
      }
      let newThread = new Msgs({
        msgs: [msgSchema]
      })
        newThread.save().then(async (thread)=>{
          let dm = {threadId: thread._id, userId: msg.receiver._id}
          console.log(dm)
          await User.updateOne({_id:msg.user_id},{$push:{dms:dm}})
          await User.updateOne({_id:msg.receiver._id},{$push:{dms:dm}})
            let rec = connectedUsers[msg.receiver._id]
            if(rec){
              msg._id = thread._id
              io.to(rec.socketId).emit('msg', msg)
              io.to(socket.id).emit('msg', msg)
            } else {
              io.to(socket.id).emit('msg', msg)
            }
          
        })
    }
    
    
  })

socket.on('disconnect', ()=>{
  console.log(Object.keys(connectedUsers))
  for(let user in connectedUsers){
    if(connectedUsers[user].socketId===socket.id){
      delete connectedUsers[user]
    }
  }
  console.log('/////////////////////////')
  console.log(Object.keys(connectedUsers))
})





  app.post('/add/:id', (req,res)=>{
    User.updateOne({_id: req.params.id}, {$push:{messangers:req.body.id}},{new:true}).then(up=>{
      res.json(up)
    })
  })
	socket.on('create-dm', (sender, receiver) => {
    User.find({dms:/5c79bf3921fe28bdc2d3d81e/}).then(exists=>{
      if(exists.length===2){
        res.json({msg:'This conversation already exists'})
      } else {
        let newThread = new Msgs({
          user1: req.body.sender,
          user2: req.body.receiver
        })
        let ids = [req.body.sender, req.body.receiver]
        newThread.save().then((thread)=>{
          User.updateMany({_id:{$in:ids}},{$push:{dms:thread._id}}, {new:true}).then((up)=>{
            //res.json(up)
          })
        })
      }
    })
  });
};
/* redClient.set('users'+user._id, JSON.stringify(user))
redClient.expire('users'+user._id, 1000*60*60*24) 
redClient.get('users5c65ae7469e2d50677a14d65',(err, data)=>{
  socket.emit('setup', JSON.parse(data))
})  */