const redClient = require('../database/redis');

module.exports = (io, app) => {
	/* redClient.flushdb( function (err, succeeded) {
    console.log(succeeded); // will be true if successfull
  }); */
	/* redClient.hgetall('rooms',(err, str)=>{
		console.log(str)
	})
 */
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
			if (session.sessionKey !== undefined && session.sessionKey !== 'undefined') {
				//////////////////////if this client joining or creating session///////////////////
				if (session.creatingSession === false) {///////////joining session
					//////////////////////if the room exists and isnt maxed out//////////////////////////
					redClient.hexists('rooms', session.sessionKey, (err, done) => {
						if (err) {io.to(socket.id).emit('roomEntranceError', err)}

						if (done === 1) {
							redClient.hget('rooms', session.sessionKey, (err, sessionStr) => {
								if (err){socket.emit('roomEntranceError', err)}

								let sessionObj = JSON.parse(sessionStr);
								if (sessionObj.clients.length < sessionObj.maxMembers) {
									reciever = socket.id;
									socket.join(session.sessionKey);
									client = Object.assign({ socketId: socket.id }, session.user);
									sessionObj.clients.push(client);
									if (sessionObj.clients.length === sessionObj.maxMembers) {
										sessionObj.maxedOut = true;
									}
									redClient.hset('rooms', session.sessionKey, JSON.stringify(sessionObj), () => {
										io.in(session.sessionKey).emit('thisSession', sessionObj)
										console.log(sessionObj)
										socket.in(session.sessionKey).emit('signal', { type: 'newJoin' }, socket.id);		
									});
								}
							});
						} else {
							io.to(socket.id).emit('sessionExpired');
						}
					});
				} else {//////////creating session//////////
					if (session.sessionKey !== undefined && session.sessionKey !== 'undefined') {
							redClient.hexists('rooms', session.sessionKey,(err,exists)=>{
								if(err){io.to(socket.id).emit('creatingSessionError', err)}
								if(exists===0){
									client = Object.assign({ socketId: socket.id, isAdmin: true }, session.user);
									let sessionObj = {
										sessionKey: session.sessionKey,
										exists: true,
										admin: socket.id,
										playState: session.playState,
										clients: [ client ],
										category: session.category,
										subCategory: session.subCategory,
										room: session.room,
										maxMembers: session.maxMembers,
										maxedOut: false
									};
					
									//console.log('CLIENT', client)
									connecting = true;
									socket.join(session.sessionKey);		
									redClient.hset('chatMsgs', session.sessionKey, JSON.stringify([]));
									redClient.hset('videoChatMsgs', session.sessionKey, JSON.stringify([]));
									redClient.hset('rooms', session.sessionKey, JSON.stringify(sessionObj), () => {
										io.in(session.sessionKey).emit('thisSession', sessionObj);
									});
								}
							})					
					}
				}
				//console.log(rooms[session.sessionKey])
				////////////////////////////////////webrtc signaling////////////////////////////////////////
				socket.on('signal', (data) => {
					switch (data.type) {
						case 'offer':
							console.log('initiator  recieved');
							offers[socket.id] = {
								offer: data,
								id: socket.id
							};
							if (connecting == true) {
								connecting = false;
								sender = socket.id;
								io.to(reciever).emit('signal', data, socket.id);
								delete offers[socket.id];
								console.log('OFFERS', Object.keys(offers));
							}
							break;
						case 'answer':
							console.log('answer recieved');
							io.to(sender).emit('signal', data, socket.id);
							break;
						case 'candidate':
							console.log('Recieved candidate');
							if (socket.id == reciever) {
								io.to(sender).emit('signal', data, socket.id);
							} else {
								io.to(reciever).emit('signal', data, socket.id);
							}
							break;
						case 'connected':
							console.log('CONNECTED');
							endOfCandidates++;
							if (endOfCandidates === 2) {
								connecting = true;
								endOfCandidates = 0;
								if (Object.keys(offers).length > 0) {
									let offerObj = offers[Object.keys(offers)[0]];
									sender = offerObj.id;
									console.log('OFFER OBJ', offerObj.id);
									io.to(reciever).emit('signal', offerObj.offer, offerObj.id);
									delete offers[offerObj.id];
								} else {
									redClient.hexists('youtubeLists', session.sessionKey,(err,exists)=>{
										if(exists===1){
											redClient.hget('youtubeLists', session.sessionKey, (err, list) => {
												if (err) {console.log(err)}
												io.to(reciever).emit('youtubeList', JSON.parse(list));		
											});
										}
									})				
								}
							}
					}
				});
				/////////////////////////////////^^^^^^^^signaling^^^^^^//////////////////////////////////////
				//////////////////////////////////////////////////////////////////////////////////////////////
				/////////////////////////////////handling discussion content//////////////////////////////////
				socket.on('youtubeList', (videoList) => {
					let listString = JSON.stringify(videoList);
					redClient.hset('youtubeLists', session.sessionKey, listString);
					console.log('KEY', session.sessionKey);
				});
				/* socket.on('dailymotionList', (videoList) => {
					let listString = JSON.stringify(videoList);
					redClient.hset('dailymotionLists', session.sessionKey, listString);
					console.log('KEY', session.sessionKey);
				});*/
 				socket.on('sharingLink', (link)=>{
					 console.log('wtf')
					 socket.to(session.sessionKey).emit('sharingLink', link);
 				})
				socket.on('pickThisVideo', (playState) => {
					redClient.hget('rooms', session.sessionKey, (err, sessionStr) => {
						if (err) {
							console.log(err);
						}
						let sessionObj = JSON.parse(sessionStr);
						sessionObj.playState = playState;
						redClient.hset('rooms', session.sessionKey, JSON.stringify(sessionObj));
						io.to(session.sessionKey).emit('pickThisVideo', playState);
					});
				});
				socket.on('unpickThisVideo', (playState) =>{
					redClient.hget('rooms', session.sessionKey, (err, sessionStr) => {
						if (err) {
							console.log(err);
						}
						let sessionObj = JSON.parse(sessionStr);
						sessionObj.playState = playState;
						redClient.hset('rooms', session.sessionKey, JSON.stringify(sessionObj));
						io.to(session.sessionKey).emit('unpickThisVideo', playState);
					});
				})
				socket.on('giveMeVideoCurrentTime', (wtf)=>{
					let asker = socket.id;
					redClient.hget('rooms', session.sessionKey, (err, sessionStr)=>{
						if(err) {console.log(err)}
						let sessionObj = JSON.parse(sessionStr);
						if(sessionObj.playState.playing){
							sessionObj.playState.requestingTime=true;
							io.to(sessionObj.clients[0].socketId).emit('giveMeVideoCurrentTime', sessionObj.playState);
						}	
						socket.on('hereIsVideoCurrentTime', (currentTime)=>{

							sessionObj.playState.currentTime = currentTime+50;
							io.to(asker).emit('hereIsVideoCurrentTime', sessionObj.playState);
						})
					})		
				})
				socket.on('sharingTweet', (tweetObj)=>{
					redClient.hget('rooms', session.sessionKey, (err,sessionStr)=>{
						let sessionObj = JSON.parse(sessionStr);
						sessionObj.tweet = tweetObj;
						redClient.hset('rooms', session.sessionKey, JSON.stringify(sessionObj));
						socket.to(session.sessionKey).emit('sharingTweet', tweetObj);
					})					
				})
				socket.on('sendMsg', (msg) => {
					redClient.hget('videoChatMsgs', session.sessionKey, (err, msgs) => {
						if (err) {
							socket.emit('videoChatError');
						}
						let msgsArr = JSON.parse(msgs);
						if (msgsArr.length > 100) {
							msgsArr = msgsArr.slice(0, 100);
						}
						msgsArr.push(msg);
						redClient.hset('videoChatMsgs', session.sessionKey, JSON.stringify(msgsArr), (err, done) => {
							if (err) {
								io.to(socket.id).emit('videoChatError');
							}
							io.to(session.sessionKey).emit('recieveMsgs', msgsArr);
						});
					});
				});
				///////////////////////////^^^^^^handling discussion content^^^^//////////////////////////////

				/////////////////////////////////////////////////////////////////////////////
				socket.on('leave', function(data) {
					socket.leave(data);
					socket.disconnect();
				});
				socket.on('disconnect', () => {		
						redClient.hexists('rooms', session.sessionKey,(err,exists)=>{
							if(err){console.log(err)}
							if(exists===1){
								redClient.hget('rooms', session.sessionKey, (err, sessionStr)=>{
									if(err){console.log(err)}
									let sessionObj = JSON.parse(sessionStr);
									sessionObj.clients.forEach((loopClient, ind) => {
										if (loopClient.socketId === socket.id) {
											sessionObj.clients.splice(ind, 1);
											//////////make new admin/////////
											if (loopClient.isAdmin && sessionObj.clients.length > 0) {
												sessionObj.clients[0].isAdmin = true;
												sessionObj.admin = sessionObj.clients[0].socketId;
												io.to(sessionObj.clients[0].socketId).emit('adminLeftImAdminNow', loopClient.socketId);									
											}
										}
									});
									socket.in(session.sessionKey).emit('signal', { type: 'clientLeft', sessionObj: sessionObj }, socket.id);
									console.log(sessionObj.clients.length,' clients left in the room',sessionObj.room);
									
									if (sessionObj.clients.length < sessionObj.maxMembers) {
											sessionObj.maxedOut = false;
											redClient.hset('rooms', session.sessionKey, JSON.stringify(sessionObj));
											if (sessionObj.clients.length == 0) {
												if (session.sessionKey !== null && session.sessionKey !== undefined) {
													redClient.hdel('rooms', session.sessionKey);
													redClient.hexists('youtubeLists', session.sessionKey, (err, num) => {
														if (num === 1) {
															redClient.hdel('youtubeLists', session.sessionKey);
														}
													});
												}
											}							
									}						
								})
							}
						})////made new admin and deleted disconnected client
				});
				//console.log(io.sockets.adapter.rooms);
			}
		});
	});
};
