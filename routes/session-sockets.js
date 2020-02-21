const redClient = require('../database/redis');

let offers = {};
let client;
let endOfCandidates = 0;
let usersConnecting = {};
let socketInSession = {};
let session = false;
const spliceObj = (obj, keys) => {
	let spliced = {};
	keys.forEach((k) => {
		if (obj[k]) {
			spliced[k] = obj[k];
		}
	});
	return spliced;
};
module.exports = (io, socket) => {
	socket.on('createOrJoin', function(sessionObj) {
		console.log('///////////////////////////////////////////////////');
		session = sessionObj;
		///////////////////////////checking if client has the key//////////////////////////
		if (session.sessionKey !== undefined && session.sessionKey !== 'undefined') {
			//////////////////////if this client joining or creating session///////////////////
			if (session.creatingSession === false) {
				///////////joining session
				
				socketInSession[socket.id] = session.sessionKey;
				usersConnecting[socket.id] = true;
				if (session.noCam) {
					console.log('VIEWER');
					// if its a viewer
					redClient.hexists('rooms', session.sessionKey, (err, done) => {
						//////////////////////if the room exists and isnt maxed out//////////////////////////
						if (err) {
							console.log(err);
						}
						if (done === 1) {
							redClient.hget('rooms', session.sessionKey, (err, sessionStr) => {
								if (err) {
									console.log(err);
								}
								let sessionObj = JSON.parse(sessionStr);
								console.log(sessionObj);
								if (sessionObj.viewers.length < sessionObj.maxViewers) {
									socket.join(session.sessionKey);
									viewer = Object.assign({ socketId: socket.id }, session.user);
									if (sessionObj.clients.length === 0 && sessionObj.viewers.length === 0) {
										viewer.isAdmin = true;
										sessionObj.admin = socket.id;
									}

									sessionObj.viewers.push(
										spliceObj(viewer, [
											'quote',
											'socketId',
											'userName',
											'email',
											'isAdmin',
											'avatarUrl',
											'memberOf',
											'mySurkl',
											'_id',
											'guest',
										])
									);
									if (sessionObj.clients.length === sessionObj.maxMembers) {
										sessionObj.maxedOut = true;
									}
									//console.log(sessionObj)
									if (sessionObj.viewers.length === sessionObj.maxViewers) {
										sessionObj.maxedOutViewers = true;
									}
									redClient.hset('rooms', session.sessionKey, JSON.stringify(sessionObj), () => {
										redClient.hget('session-msgs', session.sessionKey, (err, msgs) => {
											if (err) console.log(err);
											io.in(session.sessionKey).emit('session', {
												clients: sessionObj.clients,
												viewers: sessionObj.viewers,
												activePlatform: sessionObj.activePlatform,
												videoId: sessionObj.videoId,
												sessionType: sessionObj.sessionType,
												playing: sessionObj.playing,
												requestingTime: sessionObj.requestingTime,
												maxMembers: sessionObj.maxMembers,
												maxViewers: sessionObj.maxViewers,
												maxedOut: sessionObj.maxedOut,
												maxedOutViewers: sessionObj.maxedOutViewers,
												category: sessionObj.category,
												msgs: JSON.parse(msgs)
											});
										});
										/* if (sessionObj.viewers.length > 5) {
											console.log('WTF', sessionObj.viewers[sessionObj.viewers.length - 2]);
											io.to(sessionObj.viewers[sessionObj.viewers.length - 2].socketId)
												.emit('signal', { type: 'another-viewer' }, socket.id);
										} else { */
											socket.in(session.sessionKey)
												.emit('signal', { type: 'newJoin' }, socket.id);
										//}
									});
								}
							});
						} else {
							io.to(socket.id).emit({type:'expired', msg:'sessionExpired'});
						}
					});
				} else {
					redClient.hexists('rooms', session.sessionKey, (err, done) => {
						if (err) {
							console.log(err);
						}
						if (done === 1) {
							redClient.hget('rooms', session.sessionKey, (err, sessionStr) => {
								if (err) {
									socket.emit('roomEntranceError', err);
								}
								let sessionObj = JSON.parse(sessionStr);
								if(session.sessionType==='stream' && sessionObj.clients.length===1) {
									io.to(socket.id).emit('connect-error', {type: 'maxedOut', msg: 'Streamer is already present'})
								} else {
									if(sessionObj.clients.length===sessionObj.maxMembers){
										io.to(socket.id).emit('connect-error', {type: 'maxedOutTrio', msg : 'Oof, its maxed out.'})
									} else {
										if (sessionObj.clients.length < sessionObj.maxMembers) {
											socket.join(session.sessionKey);
											client = Object.assign({ socketId: socket.id }, session.user);
											if (sessionObj.clients.length === 0 && sessionObj.viewers.length === 0) {
												client.isAdmin = true;
												sessionObj.admin = socket.id;
											}
											sessionObj.clients.push(
												spliceObj(client, [
													'quote',
													'socketId',
													'userName',
													'email',
													'isAdmin',
													'avatarUrl',
													'memberOf',
													'mySurkl',
													'_id',
													'guest'
												])
											);
											console.log(sessionObj.clients.length, ' clients in the room');
											if (sessionObj.clients.length === sessionObj.maxMembers) {
												sessionObj.maxedOut = true;
											}
											redClient.hset('rooms', session.sessionKey, JSON.stringify(sessionObj), () => {
												redClient.hget('session-msgs', session.sessionKey, (err, msgs) => {
													if (err) console.log(err);
													io.in(session.sessionKey).emit('session', {
														clients: sessionObj.clients,
														viewers: sessionObj.viewers,
														activePlatform: sessionObj.activePlatform,
														videoId: sessionObj.videoId,
														playing: sessionObj.playing,
														admin: sessionObj.admin,
														sessionType: sessionObj.sessionType,
														requestingTime: sessionObj.requestingTime,
														maxMembers: sessionObj.maxMembers,
														maxedOut: sessionObj.maxedOut,
														maxViewers: sessionObj.maxViewers,
														maxedOutViewers: sessionObj.maxedOutViewers,
														category: sessionObj.category,
														msgs: JSON.parse(msgs)
													});
												});
												socket.in(session.sessionKey).emit('signal', { type: 'newJoin' }, socket.id);
											});
										}
									}					
								}
							
							});
						} else {
							io.to(socket.id).emit({type:'expired', msg:'sessionExpired'});
						}
					});
				}
			} else {
				//////////creating session//////////
				if (session.sessionKey !== undefined && session.sessionKey !== 'undefined') {
					socketInSession[socket.id] = session.sessionKey;
					redClient.hexists('rooms', session.sessionKey, (err, exists) => {
						if (err) {
							io.to(socket.id).emit('creatingSessionError', err);
						}
						if (exists === 0) {
							client = Object.assign({ socketId: socket.id, admin: socket.id }, session.user);
							let sessionObj = {
								sessionKey: session.sessionKey,
								exists: true,
								admin: socket.id,
								videoId: '',
								activePlatform: session.activePlatform,
								playState: session.playState,
								clients: [ client ],
								viewers: [],
								sessionType: session.sessionType,
								category: session.category,
								subCategory: session.subCategory,
								room: session.room,
								maxMembers: session.maxMembers,
								maxViewers: session.maxViewers,
								maxedOut: false
							};

							socket.join(session.sessionKey);
							redClient.hset('session-msgs', session.sessionKey, JSON.stringify([]));
							redClient.hset('rooms', session.sessionKey, JSON.stringify(sessionObj), () => {
								io.in(session.sessionKey).emit('session', sessionObj);
							});
						}
					});
				}
			}
		}
	});
	////////////////////////////////////webrtc signaling////////////////////////////////////////
	socket.on('signal', (data, idTo) => {
		switch (data.type) {
			case 'offer':
				console.log('initiator  recieved');
				console.log('SENDER', socket.id);
				console.log('RECEIVER', idTo);
				offers[socket.id] = {
					offer: data,
					id: socket.id,
					receiver: idTo
				};
				if (usersConnecting[idTo] == true) {
					usersConnecting[idTo] = false;
					io.to(idTo).emit('signal', data, socket.id);
					delete offers[socket.id];
					console.log('OFFERS', Object.keys(offers));
				}
				break;
			case 'answer':
				console.log('answer recieved');
				io.to(idTo).emit('signal', data, socket.id);
				break;
			case 'candidate':
				console.log('Recieved candidate');
				//console.log('IDTO2',idTo)
				io.to(idTo).emit('signal', data, socket.id);
				break;
			case 'streaming':
				//streaming++;
				break;
			case 'connected':
				endOfCandidates++;
				if (endOfCandidates === 2 /* && streaming===2 */) {
					console.log('CONNECTED');
					//console.log('OFFERS', Object.keys(offers))
					usersConnecting[idTo] = true;
					endOfCandidates = 0;
					streaming = 0;
					if (Object.keys(offers).length > 0) {
						let offerObj = offers[Object.keys(offers)[0]];
						receiver = offerObj.receiver;
						console.log('OFFER OBJ', offerObj.id);
						io.to(receiver).emit('signal', offerObj.offer, offerObj.id);
						delete offers[offerObj.id];
					} /*  else {
													
								} */
				}
		}
	});
	/////////////////////////////////^^^^^^^^signaling^^^^^^^^////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////handling discussion content//////////////////////////////////
	socket.on('change-session-admin', (obj) => {
		redClient.hget('rooms', obj.sessionKey, (err, sessionStr)=>{
			let sessionObj = JSON.parse(sessionStr);
			console.log(sessionObj);
		})
	})


	socket.on('youtubeList', (listObj) => {
		let listString = JSON.stringify(listObj.list);
		redClient.hset('youtubeLists', listObj.sessionKey, listString);
	});

	
	socket.on('sharingLink', (linkObj) => {
		socket.to(linkObj.sessionKey).emit('sharingLink', linkObj.link);
	});
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
	socket.on('unpickThisVideo', (videoObj) => {
		redClient.hget('rooms', videoObj.sessionKey, (err, sessionStr) => {
			if (err) {
				console.log(err);
			}
			let sessionObj = JSON.parse(sessionStr);
			//io.to(videoObj.sessionKey).emit('unpickThisVideo', videoObj);
			let updatedSession = Object.assign(sessionObj, videoObj);
			redClient.hset('rooms', videoObj.sessionKey, JSON.stringify(updatedSession));
		});
	});
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
	socket.on('sharingTweet', (tweetObj) => {
		redClient.hget('rooms', tweetObj.sessionKey, (err, sessionStr) => {
			let sessionObj = JSON.parse(sessionStr);
			sessionObj.tweet = tweetObj;
			redClient.hset('rooms', tweetObj.sessionKey, JSON.stringify(sessionObj));
			socket.to(tweetObj.sessionKey).emit('sharingTweet', tweetObj);
		});
	});
	socket.on('session-msg', (msg) => {
		redClient.hget('session-msgs', msg.session_id, (err, msgs) => {
			if (err) {
				socket.emit('videoChatError');
			}
			let msgsArr = JSON.parse(msgs);
			if ( msgsArr !== null && msgsArr.length > 100) {
				msgsArr = msgsArr.slice(msgsArr.length-100);
			} 
			msgsArr.push(msg);
			redClient.hset('session-msgs', msg.session_id, JSON.stringify(msgsArr), (err, done) => {
				if (err) {
					io.to(socket.id).emit('videoChatError');
				}
				io.to(msg.session_id).emit('receive-session-msgs', msgsArr);
			});
		});
	});
	socket.on('session-file', (chunk, session, size, end, msgObj)=>{   
    if(end==='end-of-file'){
      redClient.hget('session-msgs', session, (err,msgsStr)=>{
        let msgs = JSON.parse(msgsStr);
        msgs.push(msgObj)
        redClient.hset('session-msgs', session, JSON.stringify(msgs));
      })
      io.in(session).emit('session-sharing-file', chunk, 'end-of-file', msgObj)
    } else {
      io.in(session).emit('session-sharing-file', chunk, size)
    }
  })

	///////////////////////////^^^^^^handling discussion content^^^^//////////////////////////////

	/////////////////////////////////////////////////////////////////////////////
	socket.on('disconnect', () => {
		socket.leave(socketInSession[socket.id]);
		redClient.hexists('rooms', socketInSession[socket.id], (err, exists) => {
			if (err) {
				console.log(err);
			}
			if (exists === 1) {
				redClient.hget('rooms', socketInSession[socket.id], (err, sessionStr) => {
					if (err) {
						console.log(err);
					}
					let sessionObj = JSON.parse(sessionStr);
					sessionObj.viewers.forEach((loopViewer, ind) => {
						if (loopViewer.socketId === socket.id) {
							sessionObj.viewers.splice(ind, 1);
							//////////make new admin/////////
							if (loopViewer.isAdmin && sessionObj.clients.length > 0) {
								sessionObj.clients[0].isAdmin = true;
								sessionObj.admin = sessionObj.clients[0].socketId;
								io.to(sessionObj.clients[0].socketId).emit('adminLeftImAdminNow');
							} else if (loopViewer.isAdmin && sessionObj.viewers.length > 0) {
								sessionObj.viewers[0].isAdmin = true;
								sessionObj.admin = sessionObj.viewers[0].socketId;
								io.to(sessionObj.viewers[0].socketId).emit('adminLeftImAdminNow');
							}
						}
					});
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
					socket
						.in(socketInSession[socket.id])
						.emit('signal', { type: 'clientLeft', sessionObj: sessionObj }, socket.id);
					console.log(sessionObj.clients.length, ' clients left in the room', sessionObj.room);
					console.log(sessionObj.viewers.length, ' viewers left in the room', sessionObj.room);
					if (sessionObj.clients.length < sessionObj.maxMembers) {
						sessionObj.maxedOut = false;
						redClient.hset('rooms', socketInSession[socket.id], JSON.stringify(sessionObj));
						if (sessionObj.clients.length == 0) {
							if (socketInSession[socket.id] !== null && socketInSession[socket.id] !== undefined) {
								//redClient.hdel('rooms', socketInSession[socket.id]);
								redClient.hexists('youtubeLists', socketInSession[socket.id], (err, num) => {
									if (num === 1) {
										redClient.hdel('youtubeLists', socketInSession[socket.id]);
									}
								});
							}
						}
					}
				});
			}
		}); ////made new admin and deleted disconnected client
	});
	socket.on('leave', () => {
		socket.leave(session.sessionKey);
		redClient.hexists('rooms', session.sessionKey, (err, exists) => {
			if (err) {
				console.log(err);
			}
			if (exists === 1) {
				redClient.hget('rooms', session.sessionKey, (err, sessionStr) => {
					if (err) {
						console.log(err);
					}
					let sessionObj = JSON.parse(sessionStr);
					sessionObj.viewers.forEach((loopViewer, ind) => {
						if (loopViewer.socketId === socket.id) {
							sessionObj.viewers.splice(ind, 1);
							//////////make new admin/////////
							if (loopViewer.isAdmin && sessionObj.clients.length > 0) {
								sessionObj.clients[0].isAdmin = true;
								sessionObj.admin = sessionObj.clients[0].socketId;
								io.to(sessionObj.clients[0].socketId).emit('adminLeftImAdminNow');
							} else if (loopViewer.isAdmin && sessionObj.viewers.length > 0) {
								sessionObj.viewers[0].isAdmin = true;
								sessionObj.admin = sessionObj.viewers[0].socketId;
								io.to(sessionObj.viewers[0].socketId).emit('adminLeftImAdminNow');
							}
						}
					});
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
					socket
						.in(session.sessionKey)
						.emit('signal', { type: 'clientLeft', sessionObj: sessionObj }, socket.id);
					console.log(sessionObj.clients.length, ' clients left in the room', sessionObj.room);
					console.log(sessionObj.viewers.length, ' viewers left in the room', sessionObj.room);
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
				});
			}
		}); ////made new admin and deleted disconnected client
	});
	//console.log(io.sockets.adapter.rooms);
};
