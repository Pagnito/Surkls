const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Msgs = require('../database/models/msg-model');
const User = require('../database/models/user-model');
//const redClient = require('../database/redis');

let vidSessionUsers = {};
let msngr_widget = {};
module.exports = (io, socket, connectedUsers) => {
	socket.on('setup-vid-dms', (user) => {
		if (user !== null) {
			user.socketId = socket.id;
			vidSessionUsers[user._id] = user;
			socket.emit('setup-vid-dms', vidSessionUsers);
		}
	});

	/* socket.on('setup', (user) => {
		user.socketId = socket.id;
		connectedUsers[user._id] = user;
		console.log('CONNECTED USERS', Object.keys(connectedUsers));
  }); */
  socket.on('closed-dm-widget', (user)=>{
    delete msngr_widget[user._id];
  });
  socket.on('clear-msg-notifs', (user, thread_id)=>{
    ////this fire after open msngr widget
    user.socketId = socket.id;
    msngr_widget[user._id] = user;
    if(thread_id){
      User.updateOne({_id:user._id,'dms.thread_id':thread_id} , {
        $set:{new_msg_count:0,'dms.$.notif': false }
      }).exec()
    }  
  })
	socket.on('msg', (msg) => {
		console.log(msg)
    let rec = connectedUsers[msg.receiver.user_id];
		if (msg._id) {
      let ms = {
        msg: msg.msg,
        userName: msg.userName,
        avatarUrl: msg.avatarUrl,
        user_id: msg.user_id,
        receiver_id: msg.receiver.user_id
      };
      Msgs.updateOne({_id: msg._id}, {$push:{msgs:ms}}).exec()
      let ids = [msg.receiver.user_id, msg.user_id]
      User.updateMany({_id:{$in:ids}, 'dms.thread_id':msg._id}, 
         {$set:{"dms.$.latestMsg": msg.msg, 'dms.$.latest_date':new Date(Date.now())}})
        .exec()

			if (rec) {
        io.to(rec.socketId).emit('msg', msg);
        io.to(socket.id).emit('msg', msg);
      } else {
        io.to(socket.id).emit('msg', msg)
      }
      if(!msngr_widget[msg.receiver.user_id]){
        User.updateOne({_id:msg.receiver.user_id, 'dms.thread_id': msg._id}, {
          $inc:{new_msg_count:1},
          $set:{'dms.$.notif':true}
        }).exec()
      }
		} else {
			console.log('NEW THREAD');
			let newThread = new Msgs({
				msgs: [ msg ]
			});
			newThread.save().then((thread) => {
				msg._id = thread._id;
				if (rec) {
					io.to(rec.socketId).emit('msg', msg);
					io.to(socket.id).emit('msg', msg);
				} else {
					io.to(socket.id).emit('msg', msg);
        }
        if(!msngr_widget[msg.receiver.user_id]){
          User.updateOne({_id:msg.receiver.user_id, 'dms.thread_id': msg._id}, {
            $inc:{new_msg_count:1},
            $set:{'dms.$.notif':true}
          }).exec()
        }     
				let dm1 = {
					thread_id: thread._id,
					user_id: msg.user_id,
					avatarUrl: msg.avatarUrl,
          userName: msg.userName,
          latestMsg: msg.msg
				};
				let dm2 = {
					thread_id: thread._id,
					user_id: msg.receiver.user_id,
					avatarUrl: msg.receiver.avatarUrl,
          userName: msg.receiver.userName,
          latestMsg: msg.msg
				};
				User.updateOne({ _id: msg.user_id }, { $push: { dms: dm2 } }).exec();
				User.updateOne({ _id: msg.receiver.user_id }, { $push: { dms: dm1 } }).exec();
			});
		}
	});

	socket.on('disconnect', () => {
    for (let user in msngr_widget) {
			if (msngr_widget[user].socketId === socket.id) {
				delete msngr_widget[user];
			}
		}
		for (let user in connectedUsers) {
			if (connectedUsers[user].socketId === socket.id) {
				delete connectedUsers[user];
			}
		}
		console.log('/////////////////////////');
		console.log(Object.keys(connectedUsers));
	});
};
/* redClient.set('users'+user._id, JSON.stringify(user))
redClient.expire('users'+user._id, 1000*60*60*24) 
redClient.get('users5c65ae7469e2d50677a14d65',(err, data)=>{
  socket.emit('setup', JSON.parse(data))
})  */
