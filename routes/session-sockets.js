const redClient = require('../database/redis');

module.exports = (io, app) => {
  /* redClient.flushdb( function (err, succeeded) {
    console.log(succeeded); // will be true if successfull
  }); */
  

	let rooms = {};
	let reciever;
	let sender;
	let offers = {};
	let client;
	let connecting = false;
	io.on('connection', function(socket) {
		socket.on('createOrJoin', function(session) {
			console.log('SESSION', session)
			if(session.sessionKey!==undefined && session.sessionKey!=='undefined'){
			if(session.creatingSession===false){
				if(rooms[session.sessionKey]){
					reciever = socket.id;
					socket.join(session.sessionKey);
					client = Object.assign({socketId:socket.id}, session.user)
					//console.log('CLIENT', client)
					rooms[session.sessionKey].clients.push(client); 
					io.in(session.sessionKey).emit('clientList', rooms[session.sessionKey].clients)
					socket.in(session.sessionKey).emit('signal',{type:'newJoin'}, socket.id);
					/* redClient.hget('youtubeLists', session.sessionKey, (err,list)=>{
						console.log(list)
						
					}) */			
				}				
			} else {	
				if(!rooms[session.sessionKey]){
					client = Object.assign({socketId:socket.id}, session.user)
					//console.log('CLIENT', client)
					connecting = true;		
					socket.join(session.sessionKey);	
					rooms[session.sessionKey] = {};
					rooms[session.sessionKey].msgs = [];        
					rooms[session.sessionKey].clients = [];
				}				
        rooms[session.sessionKey].name = session.room;
				rooms[session.sessionKey].clients.push(client);
				io.in(session.sessionKey).emit('clientList', rooms[session.sessionKey].clients)
				console.log('CREATED SESSION');
				if(session.sessionKey!==undefined && session.sessionKey!=='undefined'){
					redClient.hset('rooms', session.sessionKey, JSON.stringify(session)) 
				}		
			}
		
			////////////////////////////////////webrtc signaling////////////////////////////////////////
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
							/* rooms[session.sessionKey].clients.push(client); 
							io.in(session.sessionKey).emit('clientList', rooms[session.sessionKey].clients) */
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
		 /////////////////////////////////^^^^^^^^signaling^^^^^^//////////////////////////////////////
		 //////////////////////////////////////////////////////////////////////////////////////////////
		 /////////////////////////////////handling discussion content//////////////////////////////////
		 socket.on('wtf', (videoList)=>{
			 let listString = JSON.stringify(videoList);			
			 redClient.hset('youtubeLists', session.sessionKey, listString);
			 console.log('KEY', session.sessionKey)
		 })

		 ///////////////////////////^^^^^^handling discussion content^^^^//////////////////////////////

			if(rooms[session.sessionKey]){
				console.log(rooms[session.sessionKey].clients.length, ' CLIENTS IN ROOM', session.room);
			}
			
			socket.on('sendMsg', (data) => {
				rooms[session.sessionKey].msgs.push(data);
				if(rooms[session.sessionKey].msgs.length>100){
					rooms[session.sessionKey].msgs = rooms[session.sessionKey].msgs.slice(0,100);
				}
				io.to(session.sessionKey).emit('recieveMsgs', rooms[session.sessionKey].msgs);
      }); 
      
      //////////////////////////////////////////////
			socket.on('leave', function(data) {
				//socket.in(session.sessionKey).emit('signal', {type:"clientLeft"}, socket.id)
				socket.leave(data);
				socket.disconnect();

			}); 
			socket.on('disconnect', () => {
				socket.in(session.sessionKey).emit('signal', {type:'clientLeft'}, socket.id)
				socket.disconnect();
				if(rooms[session.sessionKey]){
					rooms[session.sessionKey].clients.forEach((loopClient, ind) => {
						if (loopClient.socketId === socket.id) {
							console.log('deleting')
							rooms[session.sessionKey].clients.splice(ind, 1);
						}
					});	
					console.log('a client disconnected');
					console.log(rooms[session.sessionKey].clients.length, ' clients left in the room', session.room);	
					if(rooms[session.sessionKey].clients.length==0){
						if(session.sessionKey!==null && session.sessionKey!==undefined){
							redClient.hdel('rooms', session.sessionKey);
							redClient.hexists('youtubeLists', session.sessionKey,(err,num)=>{
								if(num===1){
									redClient.hdel('youtubeLists', session.sessionKey);
								}
							})				
						}		
						rooms[session.sessionKey] = {};
						delete rooms[session.sessionKey]
					}	
				}						
      });
			//console.log(io.sockets.adapter.rooms);
			}
		});
	});
}
