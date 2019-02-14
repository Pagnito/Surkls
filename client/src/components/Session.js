import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import { getDevices, sendThisVideoAction, newAdmin, sendTweetAction, updateSession, unpickThisVideoAction, closeMenus } from 'actions/actions';
import PropTypes from 'prop-types';
import Dropdown from 'components/smalls/drop-menu-mutable';
import SessionContentYoutube from 'components/smalls/session-content-youtube';
import SessionContentDailymotion from 'components/smalls/session-content-dailymotion';
import SessionContentTwitter from 'components/smalls/session-content-twitter';
import SessionContentTwitch from 'components/smalls/session-content-twitch';
import ProfileModal from 'components/smalls/profile-modal';
import 'styles/session.scss';
import 'styles/loader.scss';
class Session extends Component {
	constructor(props) {
		super(props);
		this.state = {
			streamSize: {
				height: 400,
				width: 400,
				
			},
			profileModal: {
				vis: false,
				pos: false,
				user: {
					avatar: '',
					userName: '',
					description: '',
				}
			},
			shareLink: '',
			connectedToSock: false,
			msgs: [],
			msg: '',
			errors: {},
			talk: true,
			showMyStream: true,
			clientList: [],
			platformMenuVisible: false,
			sessionExists: true
		};
		//////////////////////////////////////
		this.stunConfig = {
			iceServers: [
				{
					urls: 'stun:stun.l.google.com:19302'
				},
				{
					urls: 'turn:numb.viagenie.ca',
					credential: 'numbass8',
					username: 'pavelyeganov@gmail.com'
				}
			]
		};
		this.alreadyStarted = false;
		this.imNotTheNew = false;
		this.stream;
		this.track = [];
		this.remoteClients = [];
		this.rtcs = {};
		this.remoteAdded = {
			added: false,
			videoEl: null
		};
		this.socket = io('http://localhost:4000');
		this.socket.on('connect', () => {
			this.setState({ connectedToSock: true });
		});
		this.socket.on('recieveMsgs', (data) => {
			this.setState({ msgs: data });
		});
		this.socket.on('pickThisVideo', (videoObj) => {
			this.props.sendThisVideoAction(videoObj);
		});
		this.socket.on('unpickThisVideo', (videoObj) => {
			this.props.unpickThisVideoAction(videoObj);
		});
		this.socket.on('adminLeftImAdminNow', () => {
			this.props.newAdmin();
		});
		this.socket.on('youtubeList', (youtubeList) => {
			this.props.updateSession({ youtubeList: youtubeList });
		});
		this.socket.on('sessionExpired', () => {
			this.setState({ sessionExists: false });
		});
		this.socket.on('giveMeVideoCurrentTime', (videoObj) => {
			this.props.updateSession(videoObj);
		});
		this.socket.on('hereIsVideoCurrentTime', (videoObj) => {
			this.props.updateSession(videoObj);
		});
		this.socket.on('sharingTweet', (tweetObj)=>{
			this.props.sendTweetAction(tweetObj)
		})
		this.socket.on('sharingLink', (link)=>{
			window.open(link, 'mywin', 'width=860,height=620,screenX=950,right=50,screenY=50,top=50,status=yes');
		})
	}
	/////////////////////////////////////////end of state//////////////////////////////////
	sendVideoSignal = (playState) => {
		///will go into props
		this.socket.emit('pickThisVideo', playState);
	};
	unpickThisVideo = (playState) => {
		this.socket.emit('unpickThisVideo', playState);
	};
	saveYoutubeListRedis = (youtubeList) => {
		if (this.props.session.isAdmin) {
			this.socket.emit('youtubeList', youtubeList);
		}
	};
	sendTweetToOthers = (tweetObj) =>{
		this.socket.emit('sharingTweet', tweetObj)
	}
	shareLink = (e) => {
		if(e.key ==='Enter'){
			this.setState({shareLink:''},()=>{
				this.socket.emit('sharingLink', this.state.shareLink)
			})		
		}	
	}
	closeMenus = () =>{
		this.props.closeMenus('close-menus');
	}

	//////////////////////////////////////////////webrtc funcs////////////////////////////////////////////
	handleOfferError = (err) => {
		console.log(err);
		let errors = {};
		errors.offer = 'Someones offer to connect failed';
		this.setState({ errors: errors });
	};
	handleAnswerError = (err) => {
		console.log(err);
		let errors = {};
		errors.answer = 'Your browser failed open a connection';
		this.setState({ errors: errors });
	};
	handleCandidateError = (err) => {
		console.log(err);
		let errors = {};
		errors.candidates = "Your browser couldn't find a connection protocol";
		this.setState({ errors: errors });
	};
	handleRemoteDescError = (err) => {
		console.log(err);
		let errors = {};
		errors.remoteDescription = "Your browser couldn't set up a remote connection";
		this.setState({ errors: errors });
	};
	handleLocalDescError = (err) => {
		console.log(err);
		let errors = {};
		errors.localDescription = 'Your browser failed to establish a connection';
		this.setState({ errors: errors });
	};
	handleRemoteStreamAdded = (event) => {
		console.log('REMOTE', event.streams);
		if (this.remoteAdded.added === false) {
			this.remoteAdded.added = true;
			let client = this.remoteClients[this.remoteClients.length - 1];
			this.createVideo().then((video) => {
				console.log('HOW');
				this.remoteAdded.videoEl = video.vid;
				if (video.vid.srcObject == null) {
					video.vid.srcObject = event.streams[0];
					video.vid.setAttribute('data-id', client);
					video.vidWrap.setAttribute('data-id', client);
					this.remoteAdded.id = event.streams[0].id;
				}
			});
		}
		if (this.remoteAdded.added === true && this.remoteAdded.id === event.streams[0].id) {
			this.remoteAdded.videoEl.srcObject = event.streams[0];
			this.remoteAdded.added = false;
			if (this.imNotTheNew == false) {
				console.log('ADDED STREAM');
			}
		}
	};

	handleRemoteStreamRemoved = (event) => {
		console.log('removed', event);
	};
	handleIceCandidate = (event) => {
		if (event.candidate) {
			//console.log(event.candidate)
			let candidate = {
				type: 'candidate',
				label: event.candidate.sdpMLineIndex,
				id: event.candidate.sdpMid,
				candidate: event.candidate.candidate
			};
			this.socket.emit('signal', candidate);
		} else {
			console.log('End of candidates.');
			//if (this.imNotTheNew == false) {
			this.socket.emit('signal', { type: 'connected' });
			//}
		}
	};
	createOffer = (peer, cb) => {
		peer
			.createOffer()
			.then(
				(offer) => {
					return peer
						.setLocalDescription(new RTCSessionDescription(offer))
						.then(() => {
							cb(offer);
						})
						.catch(this.handleLocalDescError);
				},
				(err) => {
					console.log('Error with creating offer ', err);
				}
			)
			.catch(this.handleOfferError);
	};
	createAnswer = (peer, cb) => {
		peer
			.createAnswer()
			.then(
				(answer) => {
					//console.log('answer')
					return peer
						.setLocalDescription(new RTCSessionDescription(answer))
						.then(() => {
							cb(answer);
						})
						.catch(this.handleLocalDescError);
				},
				(err) => {
					console.log('Error with creating answer ', err);
				}
			)
			.catch(this.handleAnswerError);
	};

	handleLeavingClient = (sessionObj, remoteId) => {
		let iterator = 0;
		let streams = document.getElementsByClassName('stream');
		let streamWraps = document.getElementsByClassName('streamWrap');
		let streamList = document.getElementById('videoStreams');
		for (let stream of streams) {
			if (stream.dataset.id === remoteId) {
				stream.srcObject.getTracks().forEach((track) => {
					track.stop();
					stream.srcObject = null;
					this.remoteClients.splice(iterator, 1);
				});
			}
			iterator++;
		}
		if(this.rtcs[remoteId]){
			this.rtcs[remoteId].close();
		}
		for (let streamWrap of streamWraps) {
			if (streamWrap.dataset.id === remoteId) {
				streamList.removeChild(streamWrap);
			}
		}
		this.props.updateSession({ clients: sessionObj.clients });

		delete this.rtcs[remoteId];
	};
	createPeerRtc = (remoteId, cb) => {
		this.rtcs[remoteId] = new RTCPeerConnection(this.stunConfig);
		let currentConnection = this.rtcs[remoteId];
		currentConnection.onicecandidate = this.handleIceCandidate;
		currentConnection.ontrack = this.handleRemoteStreamAdded;
		currentConnection.onremovestream = this.handleRemoteStreamRemoved;
		if (this.track[0].kind === 'audio') {
			this.track.reverse();
		}
		this.track.forEach((track) => {
			currentConnection.addTrack(track, this.stream);
		});
		if (currentConnection.setRemoteDescription) {
			cb(currentConnection);
		}
	};

	///////////////////////////////////////////webrtc^^^ funcs////////////////////////////////////////////

	//////////////////////////////////////////////lifecycle hook//////////////////////////////////////////
	componentWillUnmount() {
		this.rtcs = {};
		let streamOfMe = document.getElementById('streamOfMe');
		streamOfMe.srcObject.getTracks().forEach((track) => track.stop());
		streamOfMe.srcObject = null;
		let streams = document.querySelectorAll('.stream');
		if (streams !== null && streams.length !== 0) {
			for (let stream of streams) {
				let tracks = stream.srcObject.getTracks();
				tracks.forEach(function(track) {
					track.stop();
				});
				streams = null;
			}
		}
		this.socket.emit('leave');
		this.props.updateSession({
			inSession: false,
			activePlatform: 'youtube',
			room: '',
			admin: '',
			clients: [],
			exists: false,
			sessionKey: '',
			creatingSession: false
		})
	}
	startOrJoin = () => {
		this.startStream(document.getElementById('streamOfMe'))
			.then(() => {
				this.alreadyStarted = true;
				let startingOrJoining;
				if (this.props.session.creatingSession) {
					startingOrJoining = this.props.session.creatingSession ? true : false;
				} else {
					startingOrJoining = false;
				}
				this.props.session.inSession = true;
				this.props.session.sessionKey = this.props.match.params.room.replace('room=', '');
				this.props.session.creatingSession = startingOrJoining;
				this.props.session.user = this.props.auth;
				this.socket.emit('createOrJoin', this.props.session);
				this.socket.on('signal', (data, remoteId) => {
					switch (data.type) {
						case 'newJoin':
							this.createPeerRtc(remoteId, (rtc) => {
								//console.log(rtc);
								this.createOffer(rtc, (offer) => this.socket.emit('signal', offer));
								this.remoteClients.push(remoteId);
							});
							break;
						case 'offer':
							this.remoteClients.push(remoteId);
							this.createPeerRtc(remoteId, (rtc) => {
								rtc
									.setRemoteDescription(new RTCSessionDescription(data))
									.then(() => {
										this.createAnswer(rtc, (answer) => this.socket.emit('signal', answer));
									})
									.catch(this.handleRemoteDescError);
							});
							break;
						case 'answer':
							this.imNotTheNew = true;
							this.rtcs[remoteId]
								.setRemoteDescription(new RTCSessionDescription(data))
								.catch(this.handleRemoteDescError);
							break;
						case 'candidate':
							let hisCandidate = new RTCIceCandidate({
								sdpMLineIndex: data.label,
								candidate: data.candidate
							});
							if (this.rtcs[remoteId] !== undefined && this.rtcs[remoteId].remoteDescription.type) {
								this.rtcs[remoteId].addIceCandidate(hisCandidate).catch(this.handleCandidateError);
							}
							break;
						case 'clientLeft':
						
							this.handleLeavingClient(data.sessionObj, remoteId);
							break;
						case 'connected':
							break;
					}
				});
			})
			.catch((err) => console.log(err));
	};
	componentDidUpdate(prevProps, prevState) {
		if(this.props.app.menus ==='close-menus'){
			this.props.closeMenus('rdy-to-open');
		}
		if (prevState.errors !== this.state.errors) {
			setTimeout(() => {
				this.setState({ errors: {} });
			}, 2000);
		}
		if (this.state.msgs !== prevState.msgs) {
			const chatBox = document.getElementById('chatMsgsShow');
			if (chatBox !== null) {
				chatBox.scrollTop = chatBox.scrollHeight;
			}
		}
		if (this.props.auth !== prevProps.auth) {///waiting for props to load
			//if using a invite link /room=:id also handles reloads
			//notShareLink wont exist in props because its a direct enter via share link
			if (!this.props.session.notShareLink && !this.alreadyStarted) {
				this.socket.on('session', (sessionObj) => {
					if(sessionObj.clients.length===1){			
						sessionObj.isAdmin=true;
					}
					this.props.updateSession(sessionObj);
				});
				this.startOrJoin();
			}
		}
		if (this.props.session.clients !== prevProps.session.clients) {
			let constraints = {
				width: this.props.session.clients.length < 3 ? '100%' : '400px',
				height: this.props.session.clients.length < 3 ? '100%' : '50%'
			};
			let streams = document.getElementsByClassName('streamWrap');
			for (let stream of streams) {
				stream.style.width = constraints.width;
				stream.style.height = constraints.height;
			}
		}
		/* navigator.mediaDevices.ondevicechange = () => {
			this.updateDevices();
		};*/
		///////////////////////////////////////////////
	}

	componentDidMount() {
		////start session button provides creatingSession = true in props
		////notShareLink is provided if clicked via join button
		///those props being passed to the server which will handle 
		///those entrances accordingly
		///never pass the whole sessionObj around to everyone
		navigator.mediaDevices.ondevicechange = () => {
			this.updateDevices();
		};
		if (this.props.session.notShareLink || this.props.session.creatingSession) {
			if (this.props.session.sessionKey && !this.alreadyStarted) {
				this.socket.on('session', (sessionObj) => {
					if(sessionObj.clients.length===1){
						//on join on client list is passed back
						//on creating saved redis sessionObj is passed to creator
						sessionObj.isAdmin=true
					}
					this.props.updateSession(sessionObj);
				});
				this.startOrJoin();
			} /* else {
				//handles a join
				console.log('joined')
				if (!this.props.session.notShareLink && !this.alreadyStarted) {
					this.socket.on('session', (sessionObj) => {
						if(sessionObj.clients.length===1){
							sessionObj.isAdmin=true
						}
						this.props.updateSession(sessionObj);
					});
					this.startOrJoin();
				}
			} */
		}
	}

	///////////////////////////////////////////lifecycle^^^hooks////////////////////////////////////////
	askForVideoCurrentTime = () => {
		setTimeout(() => {
			this.socket.emit('giveMeVideoCurrentTime', 'wtf');
		}, 500);
	};
	sendVideoCurrentTime = (playState, cb) => {
		setTimeout(() => {
			this.socket.emit('hereIsVideoCurrentTime', playState);
			cb();
		}, 1000);
	};
	pickPlatform = (platform) => {
		this.renderPlatformMenu()
		this.props.updateSession({activePlatform: platform});
	};
	renderPlatform = () => {
		if (this.props.session.activePlatform === 'youtube') {
			return (
				<SessionContentYoutube
					sendVideoSignal={this.sendVideoSignal}
					saveYoutubeListRedis={this.saveYoutubeListRedis}
					unpickThisVideo={this.unpickThisVideo}
					sendVideoCurrentTime={this.sendVideoCurrentTime}
					askForVideoCurrentTime={this.askForVideoCurrentTime}
				/>
			);
		} else if (this.props.session.activePlatform === 'dailymotion') {
			return (
				<SessionContentDailymotion
					sendVideoSignal={this.sendVideoSignal}
					saveYoutubeListRedis={this.saveYoutubeListRedis}
					unpickThisVideo={this.unpickThisVideo}
					sendVideoCurrentTime={this.sendVideoCurrentTime}
					askForVideoCurrentTime={this.askForVideoCurrentTime}
				/>
			);
		} else if (this.props.session.activePlatform === 'twitch') {
			return (
				<SessionContentTwitch
					sendVideoSignal={this.sendVideoSignal}
					unpickThisVideo={this.unpickThisVideo}
					sendVideoCurrentTime={this.sendVideoCurrentTime}
					askForVideoCurrentTime={this.askForVideoCurrentTime}
				/>
			);
		} else if (this.props.session.activePlatform === 'twitter') {
			return (
				<SessionContentTwitter
					sendTweetToOthers={this.sendTweetToOthers}
				/>
			);
		} /* else {
			return (
				<SessionContentDailymotion
					sendVideoSignal={this.sendVideoSignal}
					saveYoutubeListRedis={this.saveYoutubeListRedis}
					unpickThisVideo={this.unpickThisVideo}
					sendVideoCurrentTime={this.sendVideoCurrentTime}
					askForVideoCurrentTime={this.askForVideoCurrentTime}
				/>
			);
		} */
	};

	updateDevices = () => {
		this.props.getDevices();
	};
	updateClientList = () => {
		if (this.props.session.clients !== undefined && this.props.session.clients.length > 0) {
			return this.props.session.clients.map((client, ind) => {
				let url = client.avatarUrl ? client.avatarUrl : '/assets/whitehat.jpg'
				if(client.isAdmin){
					return(
						<img key={ind} style={{
							border:'2px solid #FECC44',
							 boxSizing:'border-box'}} src={url} className="clientSquareAv" />
					)
				} else {
					return <img key={ind} src={client.avatarUrl} className="clientSquareAv" />
				}		
			});
		}
	};

	sendMsg = (e) => {
		if (e.key == 'Enter') {
			let date = new Date(Date.now());
			let locale = date.toLocaleDateString();
			let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
			let time = date.getHours() + ':' + minutes;
			let fullDate = locale + ' ' + time;
			let msg = {
				avatar: this.props.auth.avatarUrl,
				userName: this.props.auth.userName,
				date: fullDate,
				msgText: this.state.msg
			};
			e.preventDefault();
			this.socket.emit('sendMsg', msg);
			this.setState({ msg: '' });
		}
	};
	onInputChange = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};
	renderChatText = () => {
		return this.state.msgs.map((msg, ind) => {
			let url = msg.avatar ? msg.avatar : '/assets/whitehat.jpg'
			return (
				<div key={ind} className="chatMsg">
					<img data-user={JSON.stringify(msg)} onMouseEnter={this.showProfileModal} className="chatMsgAvatar" src={url} />
					<div className="chatHeaderNmsg">
						<div className="chatMsgUserInfo">
							<div className="chatMsgName">{msg.userName}</div>
							<div className="chatMsgDate">{msg.date}</div>
						</div>
						<div className="chatMsgText">{msg.msgText}</div>
					</div>
				</div>
			);
		});
	};
	hideProfileModal =()=>{
		this.setState({
			profileModal:{
				pos:[0 ,0],
				vis: false,
				user: {}
			}
		})
	}
	showProfileModal = (e) => {
		let user = JSON.parse(e.target.dataset.user);
		console.log(user)
		this.setState({
			profileModal:{
				pos:[e.clientX, e.clientY],
				vis: true,
				user: user
			}
		})
	}
	createVideo = () => {
		return new Promise((resolve) => {
			let constraints = {
				width: this.props.session.clients.length < 3 ? '100%' : '400px',
				height: this.props.session.clients.length < 3 ? '100%' : '50%'
			};
			let streamRows = document.getElementById('videoStreams');
			let videoWrap = document.createElement('div');
			videoWrap.setAttribute('class', 'streamWrap');
			videoWrap.style.width = constraints.width;
			videoWrap.style.height = constraints.height;
			let video = document.createElement('video');
			video.autoplay = true;
			video.setAttribute('class', 'stream');
			videoWrap.appendChild(video);
			streamRows.appendChild(videoWrap);
			resolve({ vid: video, vidWrap: videoWrap });
		});
	};
	toggleAudio = () => {
		let icon = document.getElementById('mic-icon');
		let aud = document.getElementById('streamOfMe').srcObject.getAudioTracks();
		if (this.state.talk === true) {
			for (let i = 0; i < aud.length; i++) {
				aud[i].enabled = false;
			}
			this.setState({ talk: false }, () => {
				icon.style.fill = '#353535';
			});
		} else {
			for (let i = 0; i < aud.length; i++) {
				aud[i].enabled = true;
			}
			this.setState({ talk: true }, () => {
				icon.style.fill = '#F4FBFB';
			});
		}
	};
	toggleVideo = () => {
		let icon = document.getElementById('cam-icon');
		let vid = document.getElementById('streamOfMe').srcObject.getVideoTracks();
		if (this.state.showMyStream === true) {
			for (let i = 0; i < vid.length; i++) {
				vid[i].enabled = false;
			}
			this.setState({ showMyStream: false }, () => {
				icon.style.fill = '#353535';
			});
		} else {
			for (let i = 0; i < vid.length; i++) {
				vid[i].enabled = true;
			}
			this.setState({ showMyStream: true }, () => {
				icon.style.fill = '#F4FBFB';
			});
		}
	};
	startStream = (videoEl) => {
		return new Promise((resolve, reject) => {
			if (videoEl.srcObject === null) {
				navigator.mediaDevices
					.getUserMedia({
						audio: {
							deviceId: this.props.session.mic ? this.props.session.mic : 'default'
						},
						video: {
							width: 250,
							height: 250,
							deviceId: this.props.session.cam ? this.props.session.cam : 'default'
						}
					})
					.then((stream) => {
						videoEl.srcObject = stream;
						//console.log(videoEl.srcObject)
						this.stream = stream;
						stream.getTracks().forEach((track) => {
							this.track.push(track);
							//console.log('TRACK', track);
						});
						resolve();
					});
			} else {
				reject('Nop');
			}
		});
	};
	openGoogleWindow = () =>{
		window.open('https://google.com/', 'mywin', 'width=860,height=620,screenX=950,right=50,screenY=50,top=50,status=yes');
	}
	platformsMenu = () => {
		let visibility = this.state.platformMenuVisible ? 'flex' : 'none';
		return (
			<Dropdown menuTitle="Platforms" menuTypeArrow="platformsArrow" visibility={visibility}>
				<div onClick={() => this.pickPlatform('youtube')} className="menuItem_mutable">
					Youtube
				</div>
				<div onClick={() => this.pickPlatform('dailymotion')} className="menuItem_mutable">
					Daily Motion
				</div>
				<div onClick={() => this.pickPlatform('twitter')}  className="menuItem_mutable">
					Twitter
				</div>
				<div onClick={() => this.pickPlatform('twitch')}  className="menuItem_mutable">
					Twitch
				</div>
				<div  onClick={this.openGoogleWindow} className="menuItem_mutable">Google</div>
				<div className="menuInputWrap_mutable">
					<input 
					onKeyDown={this.shareLink} 
					onChange={this.onInputChange}
					placeholder="Share Link" 
					value={this.state.shareLink}
					name="shareLink"
					className="menuInput_mutable"></input>
				</div>
				{/*<div className="menuItem_mutable">Soundcloud</div>
				<div className="menuItem_mutable">Medium</div>
				<div className="menuItem_mutable">Instagram</div>
				<div className="menuItem_mutable">Reddit</div> */}
			</Dropdown>
		);
	};
	renderPlatformMenu = () => {
		this.setState({ platformMenuVisible: this.state.platformMenuVisible ? false : true });
	};
	renderErrors = () => {
		let error = this.state.errors.answer
			? this.state.errors.answer
			: this.state.errors.offer
				? this.state.errors.offer
				: this.state.errors.candidates
					? this.state.errors.candidates
					: this.state.errors.localDescription
						? this.state.errors.localDescription
						: this.state.errors.remoteDescription ? this.state.errors.remoteDescription : '';
		return (
			<div style={{ display: error.length > 1 ? 'flex' : 'none' }} id="streamsErrorModal">
				{error}
			</div>
		);
	};
	//////////////////////////////////////////////RENDER//////////////////////////////////////////////////
	render() {
		if (this.props.auth == null || this.props.session === null) {
			return (
				<div id="spinnerWrap">
					<div className="spinner" />
				</div>
			);
		} else {
			return (
				<div onClick={this.closeMenus} id="session">
					<ProfileModal hideProfileModal={this.hideProfileModal} profileModal={this.state.profileModal} />
					<div style={{ display: this.state.sessionExists ? 'none' : 'flex' }} id="sessionExpiredContainer">
						<div id="sessionExpiredModal">This session has expired :/</div>
					</div>
					{/*////////////////////////////////////*/}
					<div id="sessionLeftAside">
						<div id="videoStreams">
							{/* <div className="streamWrap">
								<video className="streamTest" autoPlay></video>
							</div>  */}
							{this.renderErrors()}
						</div>
						<div id="sessionLeftAsideSettings">
							<video id="streamOfMe" muted="muted" autoPlay />
							<div id="toggleDevices">
								<div onClick={this.toggleAudio} id="toggleAudio">
									{
										<svg
											aria-hidden="true"
											focusable="false"
											data-prefix="fas"
											data-icon="microphone-slash"
											id="mic-icon"
											role="img"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 640 512"
										>
											<path d="M633.82 458.1l-157.8-121.96C488.61 312.13 496 285.01 496 256v-48c0-8.84-7.16-16-16-16h-16c-8.84 0-16 7.16-16 16v48c0 17.92-3.96 34.8-10.72 50.2l-26.55-20.52c3.1-9.4 5.28-19.22 5.28-29.67V96c0-53.02-42.98-96-96-96s-96 42.98-96 96v45.36L45.47 3.37C38.49-2.05 28.43-.8 23.01 6.18L3.37 31.45C-2.05 38.42-.8 48.47 6.18 53.9l588.36 454.73c6.98 5.43 17.03 4.17 22.46-2.81l19.64-25.27c5.41-6.97 4.16-17.02-2.82-22.45zM400 464h-56v-33.77c11.66-1.6 22.85-4.54 33.67-8.31l-50.11-38.73c-6.71.4-13.41.87-20.35.2-55.85-5.45-98.74-48.63-111.18-101.85L144 241.31v6.85c0 89.64 63.97 169.55 152 181.69V464h-56c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16z" />
										</svg>
									}
								</div>
								<div onClick={this.toggleVideo} id="toggleVideo">
									<svg
										aria-hidden="true"
										focusable="false"
										data-prefix="fas"
										data-icon="video-slash"
										id="cam-icon"
										role="img"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 640 512"
									>
										<path d="M633.8 458.1l-55-42.5c15.4-1.4 29.2-13.7 29.2-31.1v-257c0-25.5-29.1-40.4-50.4-25.8L448 177.3v137.2l-32-24.7v-178c0-26.4-21.4-47.8-47.8-47.8H123.9L45.5 3.4C38.5-2 28.5-.8 23 6.2L3.4 31.4c-5.4 7-4.2 17 2.8 22.4L42.7 82 416 370.6l178.5 138c7 5.4 17 4.2 22.5-2.8l19.6-25.3c5.5-6.9 4.2-17-2.8-22.4zM32 400.2c0 26.4 21.4 47.8 47.8 47.8h288.4c11.2 0 21.4-4 29.6-10.5L32 154.7v245.5z" />
									</svg>
								</div>
							</div>
							<div id="restOfSettings">
								<div id="shareLink">Invite Link</div>
								<select id="sessVidDevices" />
								<select id="sessAudDevices" />
							</div>
						</div>
					</div>
					<div id="sessionCenterAside">
						<div id="discussContent">
							<div id="platformMenuAligner">
								<div
									onClick={this.renderPlatformMenu}
									id="contentDropdownIcon"
									className="discHeaderIcon"
								>
									</div>
									{this.platformsMenu()}			
							</div>
							{this.renderPlatform()}
						</div>
						<div id="chatSection">
							<div id="chatBox">
								<div id="chatMsgsShow">{this.renderChatText()}</div>
								<textarea
									value={this.state.msg}
									onChange={this.onInputChange}
									onKeyDown={this.sendMsg}
									name="msg"
									placeholder="Type here to chat"
									id="chatInputBox"
								/>
								<div style={{ display: this.props.auth.userName ? 'none' : 'flex' }} id="noAuthLayer">
									You need to log in to chat.
								</div>
							</div>
						</div>
					</div>
					<div id="sessionRightAside">
						<div id="whosInRoom">{this.updateClientList()}</div>
					</div>
				</div>
			);
		}
	}
}
Session.propTypes = {
	auth: PropTypes.object,
	session: PropTypes.object,
	history: PropTypes.object,
	match: PropTypes.object,
	devices: PropTypes.object,
	getDevices: PropTypes.func,
	sendThisVideoAction: PropTypes.func,
	newAdmin: PropTypes.func,
	updateSession: PropTypes.func,
	unpickThisVideoAction: PropTypes.func,
	sendTweetAction: PropTypes.func,
	app: PropTypes.object,
	closeMenus: PropTypes.func
};
function stateToProps(state) {
	return {
		auth: state.auth.user,
		session: state.session,
		devices: state.devices,
		app: state.app
	};
}
export default connect(stateToProps, {
	sendTweetAction,
	getDevices,
	sendThisVideoAction,
	newAdmin,
	unpickThisVideoAction,
	updateSession,
	closeMenus
})(Session);
