const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Msgs = require('../database/models/msg-model');
const User = require('../database/models/user-model');
//const redClient = require('../database/redis');
let connectedUsers = {};
let msgs = {};
module.exports = (io, socket, app) => {
  
  socket.on('setup', (user)=>{
    console.log(socket.id)
    user.socketId = socket.id;
    connectedUsers[user._id] = user;
    let msngrs = {};
    user.messangers.forEach(msngr=>{   
      if(connectedUsers[msngr]){
        msngrs[msngr] = connectedUsers[msngr]
        io.to(connectedUsers[msngr].socketId).emit('update-dms', user)  
      }        
    })
    socket.emit('setup', msngrs)
  })
  socket.on('open-dm', (user, receiver)=>{
    io.to(receiver).emit('open-dm', user)
  })
  socket.on('msg', msg=>{
    io.to(msg.receiver).emit('msg', msg)
    io.to(msg.sender).emit('msg', msg)
  })

socket.on('disconnect', ()=>{

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