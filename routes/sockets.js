const redClient = require('../database/redis');

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
			console.log(session)
			if(!rooms[session.sessionKey]){
				socket.join(session.sessionKey);	
				msgs[session.sessionKey] = [];        
        rooms[session.sessionKey] = {};
        rooms[session.sessionKey].clients = [];
			}	
			if(session.creatingSession===false){
				socket.join(session.sessionKey);
        rooms[session.sessionKey].clients.push(socket.id); 
        io.to(session.sessionKey).emit('newJoin', `A New Peer joined your room ${session.sessionKey}`);
			} else {				
        rooms[session.sessionKey].name = session.room;
        rooms[session.sessionKey].clients.push(socket.id);
        console.log('created session');
        redClient.hset('rooms', session.sessionKey, JSON.stringify(session)) 
				io.to(session.sessionKey).emit('created', `Joined session: ${session.room}`);
			}
			if(rooms[session.sessionKey]){
				console.log(rooms[session.sessionKey].clients.length, ' clients are in the room', session.room);
			}
			
			socket.on('offer', (offer) => {
				console.log('initiator offer recieved');
				offers.push(offer);
				socket.in(session.sessionKey).emit('offer', offer);
			});
			socket.on('answer', (answer) => {
				console.log('initiator answer recieved');
				answers.push(answer);
				socket.in(session.sessionKey).emit('answer', answer);
			});
			socket.on('candidate', (candidate) => {
				console.log('Recieved candidate');
				socket.in(session.sessionKey).emit('candidate', candidate);
			});
			socket.on('sendMsg', (data) => {
				msgs[session.sessionKey].push(data);
				io.to(session.sessionKey).emit('recieveMsgs', msgs[session.sessionKey]);
      }); 
      
      //////////////////////////////////////////////
			socket.on('leave', function(data) {
				socket.leave(data);
				socket.disconnect();
				if(rooms[session.sessionKey].clients.length==1){
					redClient.hdel('rooms', session.sessionKey);
				}
				console.log('client ' + socket.id + ' left');
				rooms[session.sessionKey].clients.forEach((client, ind) => {
					if (client === socket.id) {
						console.log('deleting')
						rooms[session.sessionKey].clients.splice(ind, 1);
					}
				}); 
				console.log(rooms[session.sessionKey].clients.length, ' clients left in the room', session.room);
			}); 
			socket.on('disconnect', () => {
				socket.disconnect();
				if(rooms[session.sessionKey].clients.length==1){
					redClient.hdel('rooms', session.sessionKey)
					/* rooms[session.room].clients = [] */
				}
				rooms[session.sessionKey].clients.forEach((client, ind) => {
					if (client === socket.id) {
						console.log('deleting')
						rooms[session.sessionKey].clients.splice(ind, 1);
					}
				});
				console.log('a client disconnected');
				console.log(rooms[session.sessionKey].clients.length, ' clients left in the room', session.room);
      });
      //console.log(io.sockets.adapter.rooms);
		});
	});
}
