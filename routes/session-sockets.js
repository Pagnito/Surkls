const redClient = require('../database/redis');

module.exports = (io, app) => {
  /* redClient.flushdb( function (err, succeeded) {
    console.log(succeeded); // will be true if successfull
  }); */
  /* redClient.hgetall('rooms',(err, str)=>{
		console.log(str)
	})
 */
	let rooms = {};
	let reciever;
	let sender;
	let offers = {};
	let client;
	let connecting = false;
	let endOfCandidates = 0;
	
	io.on('connection', function(socket) {
		socket.on('createOrJoin', function(session) {
			//console.log('SESSION', session)
			///////////////////////////checking if client has the key//////////////////////////
			if(session.sessionKey!==undefined && session.sessionKey!=='undefined'){		
			//////////////////////if this client joining or creating session///////////////////
			if(session.creatingSession===false){
			//////////////////////if the room exists and is maxed out//////////////////////////
				if(rooms[session.sessionKey] && rooms[session.sessionKey].clients.length < rooms[session.sessionKey].maxClients){
					reciever = socket.id;
					socket.join(session.sessionKey);
					client = Object.assign({socketId:socket.id}, session.user)
					//console.log('CLIENT', client)
					rooms[session.sessionKey].clients.push(client); 
					redClient.hget('rooms', session.sessionKey, (err,data)=>{
						let sessionObj = JSON.parse(data);
						if(rooms[session.sessionKey].clients.length === rooms[session.sessionKey].maxClients){			
							sessionObj.maxedOut = true;					
						}
						sessionObj.clients.push(client)
						redClient.hset('rooms', session.sessionKey, JSON.stringify(sessionObj),()=>{
							io.in(session.sessionKey).emit('thisSession', sessionObj)
						}) 
					})			
						redClient.hget('youtubeLists', session.sessionKey, (err,list)=>{
						if(err){
							console.log(err)
						}
						io.to(socket.id).emit('youtubeList', JSON.parse(list))
						socket.in(session.sessionKey).emit('signal',{type:'newJoin'}, socket.id);
						})
		
					
					
				}				
			} else {	
				if(session.sessionKey!==undefined && session.sessionKey!=='undefined'){	
					if(!rooms[session.sessionKey]){
						client = Object.assign({socketId:socket.id, isAdmin:true}, session.user)
						let sessionObj = {
							sessionKey: session.sessionKey,
							exists: true,
							admin: socket.id,
							playState: session.playState,
							clients: [client],
							category: session.category,
							subCategory: session.subCategory,
							room: session.room,
							maxMembers: session.maxMembers,
							maxedOut: false
						}
						let sessionChatMsgs = [];
						
						//console.log('CLIENT', client)
						connecting = true;		
						socket.join(session.sessionKey);	
						rooms[session.sessionKey] = {};
						rooms[session.sessionKey].msgs = [];        
						rooms[session.sessionKey].clients = [];
						rooms[session.sessionKey].maxClients = session.maxMembers			 				
						rooms[session.sessionKey].name = session.room;
						rooms[session.sessionKey].clients.push(client);						
						session.admin = socket.id
						redClient.hset('chatMsgs', session.sessionKey, JSON.stringify([]));
						redClient.hset('videoChatMsgs', session.sessionKey, JSON.stringify([]));
						redClient.hset('rooms', session.sessionKey, JSON.stringify(sessionObj),()=>{
							io.in(session.sessionKey).emit('thisSession', sessionObj)	
						}) 
					}
				}		
			}
			//console.log(rooms[session.sessionKey])
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
					 console.log("CONNECTED")
					 endOfCandidates++
					 if(endOfCandidates===2){
						 connecting=true;	
						 endOfCandidates=0;		
						 if(Object.keys(offers).length>0){		 
								let offerObj = offers[Object.keys(offers)[0]]
								sender=offerObj.id
								console.log('OFFER OBJ', offerObj.id)
								io.to(reciever).emit('signal', offerObj.offer, offerObj.id)
								delete offers[offerObj.id]
							} 
						}	
				} 				 
		 });
		 /////////////////////////////////^^^^^^^^signaling^^^^^^//////////////////////////////////////
		 //////////////////////////////////////////////////////////////////////////////////////////////
		 /////////////////////////////////handling discussion content//////////////////////////////////
		 socket.on('youtubeList', (videoList)=>{
			 let listString = JSON.stringify(videoList);			
			 redClient.hset('youtubeLists', session.sessionKey, listString);
			 console.log('KEY', session.sessionKey)
		 })
	
		 socket.on('pickThisVideo', (playState)=>{
				console.log(rooms[session.sessionKey])
				redClient.hget('rooms', session.sessionKey,(err, room)=>{
					if(err){
						console.log(err)
					}
					let roomObj = JSON.parse(room);
					roomObj.playState = playState;
					redClient.hset('rooms', session.sessionKey, JSON.stringify(roomObj))
					io.to(session.sessionKey).emit('pickThisVideo', playState)
				})	 
		 })
		
		 ///////////////////////////^^^^^^handling discussion content^^^^//////////////////////////////

			if(rooms[session.sessionKey]){
				console.log(rooms[session.sessionKey].clients.length, ' CLIENTS IN ROOM', session.room);
			}
			
			socket.on('sendMsg', (msg) => {
				redClient.hget('videoChatMsgs', session.sessionKey, (err, msgs)=>{
					if(err){socket.emit('videoChatError')}
					let msgsArr = JSON.parse(msgs);			
					if(msgsArr.length>100){
						msgsArr = msgsArr.slice(0,100);
					}
					msgsArr.push(msg);
					redClient.hset('videoChatMsgs', session.sessionKey, JSON.stringify(msgsArr),(err, done)=>{
						if(err) {io.to(socket.id).emit('videoChatError')}
					  io.to(session.sessionKey).emit('recieveMsgs', msgsArr);
					})
				})
      }); 
      
      /////////////////////////////////////////////////////////////////////////////
			socket.on('leave', function(data) {
				socket.leave(data);
				socket.disconnect();

			}); 
			socket.on('disconnect', () => {		
				socket.in(session.sessionKey).emit('signal', {type:'clientLeft'}, socket.id)
				socket.disconnect();
				if(rooms[session.sessionKey]){
					rooms[session.sessionKey].clients.forEach((loopClient, ind) => {
						if (loopClient.socketId === socket.id) {
							rooms[session.sessionKey].clients.splice(ind, 1);	
							//////////make new admin/////////
							if(loopClient.isAdmin){
								if(rooms[session.sessionKey].clients.length>0){
									rooms[session.sessionKey].clients[0].isAdmin=true;
									io.to(rooms[session.sessionKey].clients[0].socketId).emit('adminLeftImAdminNow', loopClient.socketId)
								}			
							}
						}
					});	
					if(rooms[session.sessionKey].clients.length<rooms[session.sessionKey].maxClients){
						redClient.hget('rooms', session.sessionKey, (err,data)=>{
							let room = JSON.parse(data);
							room.maxedOut = false;
							redClient.hset('rooms', session.sessionKey, JSON.stringify(room))
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
						})
					}
					console.log(rooms[session.sessionKey].clients.length, ' clients left in the room', session.room);					
				}						
      });
			//console.log(io.sockets.adapter.rooms);
			}
		});
	});
}
