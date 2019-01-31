const redClient = require('../database/redis');
const crypto = require('crypto');
module.exports = (io, app) => {
  /* redClient.flushdb( function (err, succeeded) {
    console.log(succeeded); // will be true if successfull
  }); */
  
	let msgs = {};
	msgs = [];

	let offers = [];
	let answers = [];
	let candidates = [];

  let rooms = {};
  let currentRoomName = '';
	io.on('connection', function(socket) {
		socket.on('createOrJoin', function(session) {
			
			console.log('YIKES', session)	
			if(!rooms[session.room]){
				currentRoomName = session.room;
				socket.join(session.room);	
				msgs[session.room] = [];        
        rooms[session.room] = {};
        rooms[session.room].clients = [];
			}	
			if(session.creatingSession===false){
				socket.join(session.room);
        rooms[session.room].clients.push(socket.id); 
        io.to(session.room).emit('newJoin', `A New Peer joined your room ${session.room}`);
			} else {				
        rooms[session.room].name = session.room;
        rooms[session.room].clients.push(session.room);
        console.log('created session');
        redClient.hset('rooms', session.room,session.room) 
				io.to(session.room).emit('created', `Joined session: ${session.room}`);
			}
			if(rooms[session.room]){
				console.log(rooms[session.room].clients.length, ' clients are in the room', session.room);
			}
			
			socket.on('offer', (offer) => {
				console.log('initiator offer recieved');
				offers.push(offer);
				socket.in(session.room).emit('offer', offer);
			});
			socket.on('answer', (answer) => {
				console.log('initiator answer recieved');
				answers.push(answer);
				socket.in(session.room).emit('answer', answer);
			});
			socket.on('candidate', (candidate) => {
				console.log('Recieved candidate');
				socket.in(session.room).emit('candidate', candidate);
			});
			socket.on('sendMsg', (data) => {
				msgs[session.room].push(data);
				io.to(session.room).emit('recieveMsgs', msgs[session.room]);
      }); 
      
      //////////////////////////////////////////////
			socket.on('leave', function(data) {
				socket.leave(data);
				socket.disconnect();
				console.log('client ' + socket.id + ' left');
				rooms[session.room].clients.forEach((client, ind) => {
					if (client === session.room) {
						rooms[session.room].clients.splice(ind, 1);
					}
				}); 
				console.log(rooms[session.room].clients.length, ' clients left in the room', session.room);
			}); 
			socket.on('disconnect', () => {
				if(rooms[session.room].clients.length==1){
					redClient.hdel('rooms', session.room)
				}
				rooms[session.room].clients.forEach((client, ind) => {
					if (client === session.room) {
						rooms[session.room].clients.splice(ind, 1);
					}
				});
				console.log('a client disconnected');
				console.log(rooms[session.room].clients.length, ' clients left in the room', session.room);
      });
      //console.log(io.sockets.adapter.rooms);
		});
	});
}
