import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import { getDevices } from 'actions/actions';
import PropTypes from 'prop-types';
import 'styles/session.scss';
import 'styles/loader.scss';
class Session extends Component {
	constructor(props) {
		super(props);
		this.state = {
			streamSize: {
				height: 400,
				width: 400
			},
			connectedToSock: false,
			msgs: [],
			msg: '',
			errors: {},
			talk: true,
			showMyStream: true,
			clientList: []
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
		this.rendered = false;
		this.imNotTheNew = false;
		this.creator = false;
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
	}
	//////////////////////////////////////////////webrtc funcs////////////////////////////////////////////
	handleOfferError = (err) => {
		console.log(err);
		errors = {};
		errors.offer = 'Someones offer to connect failed';
		this.setState({ errors: errors });
	};
	handleAnswerError = (err) => {
		console.log(err);
		errors = {};
		errors.answer = 'Your browser failed open a connection';
		this.setState({ errors: errors });
	};
	handleCandidateError = (err) => {
		console.log(err);
		errors = {};
		errors.candidates = "Your browser couldn't find a connection protocol";
		this.setState({ errors: errors });
	};
	handleRemoteDescError = (err) => {
		console.log(err);
		errors = {};
		errors.remoteDescription = "Your browser couldn't set up a remote connection";
		this.setState({ errors: errors });
	};
	handleLocalDescError = (err) => {
		console.log(err);
		errors = {};
		errors.localDescription = 'Your browser failed to establish a connection';
		this.setState({ errors: errors });
	};
	handleRemoteStreamAdded = (event) => {
		//console.log('REMOTE',event.streams)	
		if(this.remoteAdded.added===false){	
			let client = this.remoteClients[this.remoteClients.length - 1];
			this.createVideo().then((video) => {
				this.remoteAdded.videoEl = video.vid;
				if (video.vid.srcObject == null) {
				video.vid.srcObject = event.streams[0];
				video.vid.setAttribute('data-id', client);
				video.vidWrap.setAttribute('data-id', client);
				this.remoteAdded.added = true;
				this.remoteAdded.id = event.streams[0].id;
		  	}
	   });
	 }	
		if(this.remoteAdded.added === true && this.remoteAdded.id === event.streams[0].id) {
			console.log('umm what')
			this.remoteAdded.videoEl.srcObject = event.streams[0]; 
			this.remoteAdded.added = false;
		}
	};

	handleRemoteStreamRemoved = (event) => {
		console.log('removed', event);
	};
	handleIceCandidate = (event) => {
		if (event.candidate) {
			let candidate = {
				type: 'candidate',
				label: event.candidate.sdpMLineIndex,
				id: event.candidate.sdpMid,
				candidate: event.candidate.candidate
			};
			this.socket.emit('signal', candidate);
		} else {
			console.log('End of candidates.');
			if (this.imNotTheNew == false) {
				this.socket.emit('signal', { type: 'connected' });
			}
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

	handleLeavingClient = (remoteId) => {
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
		let updatedList = this.state.clientList.filter((client) => {
			return client.socketId !== remoteId;
		});
		this.setState({ clientList: updatedList });
		for (let streamWrap of streamWraps) {
			if (streamWrap.dataset.id === remoteId) {
				streamList.removeChild(streamWrap);
			}
		}
		this.rtcs[remoteId].close();
		delete this.rtcs[remoteId];
	};
	createPeerRtc = (remoteId, cb) => {
		this.rtcs[remoteId] = new RTCPeerConnection(this.stunConfig);
		let currentConnection = this.rtcs[remoteId];
		currentConnection.onicecandidate = this.handleIceCandidate;
		currentConnection.ontrack = this.handleRemoteStreamAdded;
		currentConnection.onremovestream = this.handleRemoteStreamRemoved;
		this.track.forEach((track) => {
			console.log('adding track')
				currentConnection.addTrack(track,this.stream);
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
	}
	componentDidUpdate(prevProps, prevState) {
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
		if (this.props.auth !== prevProps.auth || this.props.session !== prevProps.session) {
			if (this.rendered === false) {
				this.socket.on('clientList', (clients) => {
					this.setState({ clientList: clients });
				});
				navigator.mediaDevices.ondevicechange = () => {
					this.updateDevices();
				};
				this.startStream(document.getElementById('streamOfMe')).then(() => {
					if (this.props.session.creatingSession) {
						this.creator = true;
					}
					this.props.session.sessionKey = this.props.match.params.room.replace('room=', '');
					this.props.session.creatingSession = false;
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
								this.handleLeavingClient(remoteId);
								break;
							case 'connected':
								break;
						}
					});
				});
			}
		}
	}
	getStats = (id, stream) => {
		this.rtcs[id].getStats().then(stream).then((data) => {
			console.log(data);
		});
	};
	componentDidMount() {
		if (this.props.session.sessionKey) {
			this.socket.on('clientList', (clients) => {
				this.setState({ clientList: clients });
			});
			navigator.mediaDevices.ondevicechange = () => {
				this.updateDevices();
			};
			this.startStream(document.getElementById('streamOfMe')).then(() => {
				this.props.session.sessionKey = this.props.match.params.room.replace('room=', '');
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
							this.handleLeavingClient(remoteId);
							break;
						case 'connected':
							break;
					}
				});
				this.rendered = true;
			});
		}
	}
	///////////////////////////////////////////lifecycle^^^hooks////////////////////////////////////////
	updateDevices = () => {
		this.props.getDevices();
	};
	updateClientList = () => {
		if (this.state.clientList !== undefined && this.state.clientList.length > 0) {
			return this.state.clientList.map((client, ind) => {
				return <img key={ind} src={client.avatarUrl} className="clientSquareAv" />;
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
			return (
				<div key={ind} className="chatMsg">
					<img className="chatMsgAvatar" src={msg.avatar} />
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

	createVideo = () => {
		return new Promise((resolve, reject) => {
			let streamRows = document.getElementById('videoStreams');
			let videoWrap = document.createElement('div');
			videoWrap.setAttribute('class', 'streamWrap');
			let video = document.createElement('video');
			video.autoplay = true;
			video.setAttribute('class', 'stream');
			videoWrap.appendChild(video);
			streamRows.appendChild(videoWrap);
			resolve({ vid: video, vidWrap: videoWrap });
		});
	};
	toggleAudio = () => {
		let aud = document.getElementById('streamOfMe').srcObject.getAudioTracks();
		if (this.state.talk === true) {
			for (let i = 0; i < aud.length; i++) {
				aud[i].enabled = false;
			}
			this.setState({ talk: false });
		} else {
			for (let i = 0; i < aud.length; i++) {
				aud[i].enabled = true;
			}
			this.setState({ talk: true });
		}
	};
	toggleVideo = () => {
		let vid = document.getElementById('streamOfMe').srcObject.getVideoTracks();
		if (this.state.showMyStream === true) {
			for (let i = 0; i < vid.length; i++) {
				vid[i].enabled = false;
			}
			this.setState({ showMyStream: false });
		} else {
			for (let i = 0; i < vid.length; i++) {
				vid[i].enabled = true;
			}
			this.setState({ showMyStream: true });
		}
	};
	startStream = (videoEl) => {
		return new Promise((resolve, reject) => {
			if (videoEl.srcObject === null) {
				navigator.mediaDevices
					.getUserMedia({
						audio: !this.props.session.disableAud
							? false
							: {
									deviceId: this.props.session.mic ? this.props.session.mic : 'default'
								},
						video: {
							width: 200,
							height: 200,
							deviceId: this.props.session.cam ? this.props.session.cam : 'default'
						}
					})
					.then((stream) => {
						videoEl.srcObject = stream;
						//console.log(videoEl.srcObject)
						this.stream = stream;
						stream.getTracks().forEach((track) => {
							this.track.push(track);
							console.log('TRACK',track)
						});
						resolve();
					});
			} else {
				rejects();
			}
		});
	};

	renderErrors = () => {
		if (this.state.errors.answer) {
			return this.state.errors.answer;
		} else if (this.state.errors.offer) {
			return this.state.errors.offer;
		} else if (this.state.errors.candidates) {
			return this.state.errors.candidates;
		} else if (this.state.errors.localDescription) {
			return this.state.errors.localDescription;
		} else {
			return this.state.errors.remoteDescription;
		}
	};
	render() {
		if (this.props.auth == null || this.props.session === null) {
			return (
				<div id="spinnerWrap">
					<div className="spinner" />
				</div>
			);
		} else {
			return (
				<div id="session">
					<div id="sessionLeftAside">
						<div id="videoStreams">
							 {/* <div className="streamWrap">
								<video className="streamTest" autoPlay></video>
							</div>  */}
							<div
								style={{ display: Object.keys(this.state.errors).length > 1 ? 'flex' : 'none' }}
								id="streamsErrorModal"
							>
								{this.renderErrors()}
							</div>
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
											className="mic-icon"
											role="img"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 640 512"
										>
											<path
												fill="#F4FBFB"
												d="M633.82 458.1l-157.8-121.96C488.61 312.13 496 285.01 496 256v-48c0-8.84-7.16-16-16-16h-16c-8.84 0-16 7.16-16 16v48c0 17.92-3.96 34.8-10.72 50.2l-26.55-20.52c3.1-9.4 5.28-19.22 5.28-29.67V96c0-53.02-42.98-96-96-96s-96 42.98-96 96v45.36L45.47 3.37C38.49-2.05 28.43-.8 23.01 6.18L3.37 31.45C-2.05 38.42-.8 48.47 6.18 53.9l588.36 454.73c6.98 5.43 17.03 4.17 22.46-2.81l19.64-25.27c5.41-6.97 4.16-17.02-2.82-22.45zM400 464h-56v-33.77c11.66-1.6 22.85-4.54 33.67-8.31l-50.11-38.73c-6.71.4-13.41.87-20.35.2-55.85-5.45-98.74-48.63-111.18-101.85L144 241.31v6.85c0 89.64 63.97 169.55 152 181.69V464h-56c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16z"
											/>
										</svg>
									}
								</div>
								<div onClick={this.toggleVideo} id="toggleVideo">
									<svg
										aria-hidden="true"
										focusable="false"
										data-prefix="fas"
										data-icon="video-slash"
										className="svg-inline--fa fa-video-slash fa-w-20"
										role="img"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 640 512"
									>
										<path
											fill="#F4FBFB"
											d="M633.8 458.1l-55-42.5c15.4-1.4 29.2-13.7 29.2-31.1v-257c0-25.5-29.1-40.4-50.4-25.8L448 177.3v137.2l-32-24.7v-178c0-26.4-21.4-47.8-47.8-47.8H123.9L45.5 3.4C38.5-2 28.5-.8 23 6.2L3.4 31.4c-5.4 7-4.2 17 2.8 22.4L42.7 82 416 370.6l178.5 138c7 5.4 17 4.2 22.5-2.8l19.6-25.3c5.5-6.9 4.2-17-2.8-22.4zM32 400.2c0 26.4 21.4 47.8 47.8 47.8h288.4c11.2 0 21.4-4 29.6-10.5L32 154.7v245.5z"
										/>
									</svg>
								</div>
							</div>
							<div id="restOfSettings">
								<div id="shareLink">Share Link</div>
								<select id="sessVidDevices" />
								<select id="sessAudDevices" />
							</div>
						</div>
					</div>
					<div id="sessionCenterAside">
						<div id="discussContent">{/* <iframe src=""></iframe> */}</div>
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
	getDevices: PropTypes.func
};
function stateToProps(state) {
	return {
		auth: state.auth.user,
		session: state.session,
		devices: state.devices
	};
}
export default connect(stateToProps, { getDevices })(Session);
