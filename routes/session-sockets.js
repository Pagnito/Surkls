const redClient = require('../database/redis');
let reciever;
let sender;
let offers = {};
let client;
let connecting = false;
let endOfCandidates = 0;
let streaming = 0;
let session= false;
const spliceObj = (obj, keys) =>{
	let spliced = {};
	keys.forEach(k => {
				spliced[k] = obj[k] 
		})
		return spliced;
	}
module.exports = (io, socket, initSession) => {
	console.log('SETTING LISTENERS')

		socket.on('createOrJoin', function(sessionObj) {
			//console.log('SESSION', session)
			session = sessionObj
			///////////////////////////checking if client has the key//////////////////////////
			if (session.sessionKey !== undefined && session.sessionKey !== 'undefined') {
				//////////////////////if this client joining or creating session///////////////////
				if (session.creatingSession === false) {///////////joining session
					//////////////////////if the room exists and isnt maxed out//////////////////////////
					reciever = socket.id;	
					//console.log(reciever)
					connecting = true;
					redClient.hexists('rooms', session.sessionKey, (err, done) => {
						if (err) {io.to(socket.id).emit('roomEntranceError', err)}

						if (done === 1) {
							redClient.hget('rooms', session.sessionKey, (err, sessionStr) => {
								if (err){socket.emit('roomEntranceError', err)}							
								let sessionObj = JSON.parse(sessionStr);
								if (sessionObj.clients.length < sessionObj.maxMembers) {
									
									socket.join(session.sessionKey);
									client = Object.assign({ socketId: socket.id }, session.user);
									if(sessionObj.clients.length===0){
										client.isAdmin = true;
										sessionObj.admin = socket.id;
										sessionObj.isAdmin = true;
									}
									sessionObj.clients.push(spliceObj(client,
									 ['socketId', 'userName', 'email', 'isAdmin','avatarUrl', 'memberOf', '_id']));
									if (sessionObj.clients.length === sessionObj.maxMembers) {
										sessionObj.maxedOut = true;
									}
									console.log(sessionObj)
									redClient.hset('rooms', session.sessionKey, JSON.stringify(sessionObj), () => {
										io.in(session.sessionKey).emit('session',
										 {clients:sessionObj.clients,
										  activePlatform: sessionObj.activePlatform,
											videoId: sessionObj.videoId,
											playing: sessionObj.playing,
											requestingTime: sessionObj.requestingTime,
											maxMembers: sessionObj.maxMembers,
											maxedOut: sessionObj.maxedOut,
											isAdmin: sessionObj.clients.length===1 ? true : false,
											category: sessionObj.category,
										});
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
										videoId: '',
										activePlatform: session.activePlatform,
										playState: session.playState,
										clients: [ client ],
										category: session.category,
										subCategory: session.subCategory,
										room: session.room,
										maxMembers: session.maxMembers,
										maxedOut: false
									};
								
									socket.join(session.sessionKey);		
									redClient.hset('chatMsgs', session.sessionKey, JSON.stringify([]));
									redClient.hset('videoChatMsgs', session.sessionKey, JSON.stringify([]));
									redClient.hset('rooms', session.sessionKey, JSON.stringify(sessionObj), () => {
										console.log(sessionObj)
										io.in(session.sessionKey).emit('session', sessionObj);
									});
								}
							})					
					}
				}
			}
		})
				////////////////////////////////////webrtc signaling////////////////////////////////////////
				socket.on('signal', (data) => {
					switch (data.type) {
						case 'offer':
							console.log('initiator  recieved');
							console.log("SENDER", socket.id)
							console.log('REC',reciever);
							offers[socket.id] = {
								offer: data,
								id: socket.id
							};
							if (connecting == true) {
								connecting = false;
								sender = socket.id;
								io.to(reciever).emit('signal', data, socket.id);
								console.log("SENDING OFFER")
								delete offers[socket.id];
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
						case 'streaming':
							streaming++
							break;
						case 'connected':
							
							endOfCandidates++;
							if (endOfCandidates === 2 /* && streaming===2 */) {
								console.log('CONNECTED');
								console.log('OFFERS', offers)
								connecting = true;
								endOfCandidates = 0;
								streaming = 0;
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
				/////////////////////////////////^^^^^^^^signaling^^^^^^^^////////////////////////////////////
				//////////////////////////////////////////////////////////////////////////////////////////////
				/////////////////////////////////handling discussion content//////////////////////////////////
				socket.on('youtubeList', (listObj) => {
					let listString = JSON.stringify(listObj.list);
					redClient.hset('youtubeLists', listObj.sessionKey, listString);

				});
				
				/* socket.on('dailymotionList', (videoList) => {
					let listString = JSON.stringify(videoList);
					redClient.hset('dailymotionLists', session.sessionKey, listString);
					console.log('KEY', session.sessionKey);
				});*/
 				socket.on('sharingLink', (linkObj)=>{
					 socket.to(linkObj.sessionKey).emit('sharingLink', linkObj.link);
 				})
				socket.on('pickThisVideo', (videoObj) => {
					redClient.hget('rooms', videoObj.sessionKey, (err, sessionStr) => {
						if (err) {
							console.log(err);
						}
						io.to(videoObj.sessionKey).emit('pickThisVideo', videoObj);
						let sessionObj = JSON.parse(sessionStr);
						let updatedSession = Object.assign(sessionObj, videoObj);
						updatedSession.activePlatform = videoObj.activePlatform;
						redClient.hset('rooms', videoObj.sessionKey, JSON.stringify(updatedSession));
						
					});
				});
				socket.on('unpickThisVideo', (videoObj) =>{
					redClient.hget('rooms', videoObj.sessionKey, (err, sessionStr) => {
						if (err) {
							console.log(err);
						}
						let sessionObj = JSON.parse(sessionStr);
						io.to(videoObj.sessionKey).emit('unpickThisVideo', videoObj);
						let updatedSession = Object.assign(videoObj, sessionObj);
						updatedSession.activePlatform = videoObj.activePlatform;		
						redClient.hset('rooms', videoObj.sessionKey, JSON.stringify(updatedSession));
				
					});
				})
		/* 		socket.on('giveMeVideoCurrentTime', (wtf)=>{
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
				}) */
				socket.on('sharingTweet', (tweetObj)=>{
					redClient.hget('rooms', tweetObj.sessionKey, (err,sessionStr)=>{
						let sessionObj = JSON.parse(sessionStr);
						sessionObj.tweet = tweetObj;
						redClient.hset('rooms', tweetObj.sessionKey, JSON.stringify(sessionObj));
						socket.to(tweetObj.sessionKey).emit('sharingTweet', tweetObj);
					})					
				})
				socket.on('sendMsg', (msg) => {
					redClient.hget('videoChatMsgs', msg.sessionKey, (err, msgs) => {
						if (err) {
							socket.emit('videoChatError');
						}
						let msgsArr = JSON.parse(msgs);
						if (msgsArr.length > 100) {
							msgsArr = msgsArr.slice(0, 100);
						}
						msgsArr.push(msg);
						redClient.hset('videoChatMsgs', msg.sessionKey, JSON.stringify(msgsArr), (err, done) => {
							if (err) {
								io.to(socket.id).emit('videoChatError');
							}
							io.to(msg.sessionKey).emit('recieveMsgs', msgsArr);
						});
					});
				});
				///////////////////////////^^^^^^handling discussion content^^^^//////////////////////////////

				/////////////////////////////////////////////////////////////////////////////
				socket.on('disconnect', () => {	
					socket.leave(session.sessionKey);	
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
												io.to(sessionObj.clients[0].socketId).emit('adminLeftImAdminNow');									
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
													//redClient.hdel('rooms', session.sessionKey);
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
				socket.on('leave', () => {					
					socket.leave(session.sessionKey);	
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
												io.to(sessionObj.clients[0].socketId).emit('adminLeftImAdminNow');									
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
													//redClient.hdel('rooms', session.sessionKey);
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
			
		
		
};
