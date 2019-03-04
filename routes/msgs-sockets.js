const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Msgs = require('../database/models/msg-model');
const User = require('../database/models/user-model');
//const redClient = require('../database/redis');
let connectedUsers = {};
let vidSessionUsers = {};
let msgs = {};
module.exports = (io, socket, app) => {
	socket.on('setup-vid-dms', (user) => {
		if (user !== null) {
			user.socketId = socket.id;
			vidSessionUsers[user._id] = user;
			socket.emit('setup-vid-dms', vidSessionUsers);
		}
	});

	socket.on('setup', (user) => {
		user.socketId = socket.id;
		connectedUsers[user._id] = user;
		console.log('CONNECTED USERS', Object.keys(connectedUsers));
	});

	socket.on('msg', (msg) => {
		let rec = connectedUsers[msg.receiver._id];
		if (rec) {
			io.to(rec.socketId).emit('msg', msg);
			io.to(socket.id).emit('msg', msg);
		} else {
			io.to(socket.id).emit('msg', msg);
		}
	});

	socket.on('disconnect', () => {
		for (let user in connectedUsers) {
			if (connectedUsers[user].socketId === socket.id) {
				delete connectedUsers[user];
			}
		}
		console.log('/////////////////////////');
		console.log(Object.keys(connectedUsers))
	});

	app.post('/add/:id', (req, res) => {
		User.updateOne({ _id: req.params.id }, { $push: { messangers: req.body.id } }, { new: true }).then((up) => {
			res.json(up);
		});
	});
};
/* redClient.set('users'+user._id, JSON.stringify(user))
redClient.expire('users'+user._id, 1000*60*60*24) 
redClient.get('users5c65ae7469e2d50677a14d65',(err, data)=>{
  socket.emit('setup', JSON.parse(data))
})  */
