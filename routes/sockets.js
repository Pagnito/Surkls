const redClient = require('../database/redis');

module.exports = (io, app) => {
  /* redClient.flushdb( function (err, succeeded) {
    console.log(succeeded); // will be true if successfull
  }); */
  
	let msgs = {};
	let rooms = {};
	let reciever;
	let sender;
	let offers = {};
	let connections;
	let connecting = false;
	io.on('connection', function(socket) {
		socket.on('createOrJoin', function(session) {
			console.log('CLIENT DESC', session);
			if(session.sessionKey!==undefined && session.sessionKey!=='undefined'){
			if(session.creatingSession===false){
				if(rooms[session.sessionKey]){
					reciever = socket.id;
					socket.join(session.sessionKey);
        	rooms[session.sessionKey].clients.push(socket.id); 
					socket.in(session.sessionKey).emit('signal',{type:'newJoin'}, socket.id);
				}				
			} else {	
				if(!rooms[session.sessionKey]){
					connecting = true;
					
					socket.join(session.sessionKey);	
					msgs[session.sessionKey] = [];        
					rooms[session.sessionKey] = {};
					rooms[session.sessionKey].clients = [];
				}				
        rooms[session.sessionKey].name = session.room;
        rooms[session.sessionKey].clients.push(socket.id);
				console.log('CREATED SESSION');
				if(session.sessionKey!==undefined && session.sessionKey!=='undefined'){
					redClient.hset('rooms', session.sessionKey, JSON.stringify(session)) 
				}		
			}
			
			socket.on('signal', (data) => {
				switch (data.type){
					case 'offer':
						console.log('initiator  recieved');
						offers[socket.id] = {
							offer:data,
							id:socket.id
						};
						if(connecting==true){
							connecting=false;
							sender = socket.id
							io.to(reciever).emit('signal', data, socket.id);		
							delete offers[socket.id]
							console.log('OFFERS', Object.keys(offers))
						}	
						
					 break;
				 case 'answer':
					 console.log('answer recieved');			
					 io.to(sender).emit('signal', data, socket.id);	
					 break;
				 case 'candidate':
					 console.log('Recieved candidate');	 
					 if(socket.id==reciever){
						io.to(sender).emit('signal', data, socket.id);	
					 } else {
						io.to(reciever).emit('signal', data, socket.id);	
					 }				 
					 break;
				case 'connected':
					 		console.log("CONNECTED")
							connecting=true;			
					 if(Object.keys(offers).length>0){		 
						 let offerObj = offers[Object.keys(offers)[0]]
						 sender=offerObj.id
						 console.log('OFFER OBJ', offerObj.id)
						 io.to(reciever).emit('signal', offerObj.offer, offerObj.id)
						 delete offers[offerObj.id]
					 } 
				} 				 
		 });
			if(rooms[session.sessionKey]){
				console.log(rooms[session.sessionKey].clients.length, ' CLIENTS IN ROOM', session.room);
			}
			
			socket.on('sendMsg', (data) => {
				console.log('THESE ARE ROOMS',rooms[session.sessionKey],'END OF ROOMS')
				msgs[session.sessionKey].push(data);
				io.to(session.sessionKey).emit('recieveMsgs', msgs[session.sessionKey]);
      }); 
      
      //////////////////////////////////////////////
			socket.on('leave', function(data) {
				socket.in(session.sessionKey).emit('signal', {type:"clientLeft"}, socket.id)
				socket.leave(data);
				socket.disconnect();

			}); 
			socket.on('disconnect', () => {
				socket.disconnect();
				rooms[session.sessionKey].clients.forEach((client, ind) => {
					if (client === socket.id) {
						console.log('deleting')
						rooms[session.sessionKey].clients.splice(ind, 1);
					}
				});		
					console.log('a client disconnected');
					console.log(rooms[session.sessionKey].clients.length, ' clients left in the room', session.room);		
				if(rooms[session.sessionKey].clients.length==0){
					if(session.sessionKey!==null && session.sessionKey!==undefined){
						redClient.hdel('rooms', session.sessionKey);
					}		
					rooms[session.sessionKey] = {};
					delete rooms[session.sessionKey]
				}		
      });
			//console.log(io.sockets.adapter.rooms);
			}
		});
	});
}
