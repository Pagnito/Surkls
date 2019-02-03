import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import PropTypes from 'prop-types';
import { setUserMedia } from '../../tools/setUserMedia';
import 'styles/session.scss';

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
			msg: ''
		};
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
		this.creator = false
		this.stream;
		this.track;
		this.remoteClients = 0;
		this.rtcs = {};
		this.socket = io('http://localhost:4000');
		this.socket.on('connect', () => {
			this.setState({ connectedToSock: true });
		});
		this.socket.on('recieveMsgs', (data) => {
			this.setState({ msgs: data });
		});
	}
	handleRemoteStreamAdded = (event) => {
		let videos = document.getElementsByClassName('stream');
		for (let i = 0; i < this.remoteClients; i++) {
			if (videos[i].srcObject == null) {
				videos[i].srcObject = event.streams[0];
			}
		}
		this.socket.emit('signal', { type: 'connected' });
	};
	handleRemoteStreamRemoved = (event) => {
		console.log('removed', event);
	};
	handleIceCandidate = (event) => {
		//console.log('candidate', event.candidate)
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
		}
	};
	createOffer = (peer, cb) => {
		peer.createOffer().then(
			(offer) => {
				return peer.setLocalDescription(new RTCSessionDescription(offer)).then(() => {
					cb(offer);
				});
			},
			(err) => {
				console.log('Error with creating offer ', err);
			}
		);
	};
	createAnswer = (peer, cb) => {
		peer.createAnswer().then(
			(answer) => {
				//console.log('answer')
				return peer.setLocalDescription(new RTCSessionDescription(answer)).then(() => {
					cb(answer);
				});
			},
			(err) => {
				console.log('Error with creating answer ', err);
			}
		);
	};
	componentWillUnmount() {
		let stream = document.getElementById('stream1').srcObject;
		if (stream !== null) {
			let tracks = stream.getTracks();
			tracks.forEach(function(track) {
				track.stop();
			});
		}
		this.rtcs = {};
		stream = null;
		this.socket.emit('leave');
	}
	handleLeavingClient = (remoteId) => {
		let videos = document.getElementsByClassName('stream');
		for (let i = 0; i < this.remoteClients; i++) {
			videos[i].srcObject.getTracks().forEach(function(track) {
				track.stop();
				videos[i].srcObject = null;
			});
		}

		this.remoteClients -= 1;
		delete this.rtcs[remoteId];
	};
	createPeerRtc = (remoteId, cb) => {
		this.rtcs[remoteId] = new RTCPeerConnection(this.stunConfig);
		let currentConnection = this.rtcs[remoteId];
		currentConnection.onicecandidate = this.handleIceCandidate;
		currentConnection.ontrack = this.handleRemoteStreamAdded;
		currentConnection.onremovestream = this.handleRemoteStreamRemoved;
		currentConnection.addTrack(this.track, this.stream);
		if (currentConnection.setRemoteDescription) {
			cb(currentConnection);
		}
	};

	componentDidMount() {
		setUserMedia();
		this.startStream(document.getElementById('stream1')).then(() => {
			if(this.props.session.creatingSession){
				console.log('im creator')
				this.creator = true
			}
			this.socket.emit('createOrJoin', this.props.session);
			this.socket.on('signal', (data, remoteId) => {
				switch (data.type) {
					case 'newJoin':
						this.createPeerRtc(remoteId, (rtc) => {
							this.createOffer(rtc, (offer) => this.socket.emit('signal', offer));
							this.remoteClients++;
						});
						break;
					case 'offer':
							
						this.remoteClients++;
						this.createPeerRtc(remoteId, (rtc) => {
							console.log(this.rtcs)
							rtc.setRemoteDescription(new RTCSessionDescription(data), () => {
								this.createAnswer(rtc, (answer) => this.socket.emit('signal', answer));
							});
						});
						break;
					case 'answer':
						this.rtcs[remoteId].setRemoteDescription(new RTCSessionDescription(data));
						break;
					case 'candidate':
						let hisCandidate = new RTCIceCandidate({
							sdpMLineIndex: data.label,
							candidate: data.candidate
						});
						if (this.rtcs[remoteId] !== undefined && this.rtcs[remoteId].remoteDescription.type) {
							this.rtcs[remoteId].addIceCandidate(hisCandidate);
						}
						break;
					case 'clientLeft':
						this.handleLeavingClient(remoteId);
						break;
					case 'connected':
							
					default:
						this.socket.emit('signal', { type: 'failedConnection' });
				}
			});
		});
	}

	sendMsg = (e) => {
		if (e.key == 'Enter') {
			e.preventDefault();
			this.socket.emit('sendMsg', this.state.msg);
			this.setState({ msg: '' });
		}
	};
	onInputChange = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};
	renderChatText = () => {
		return this.state.msgs.map((msg, ind) => {
			return (
				<div key={ind} className="msg">
					{msg}
				</div>
			);
		});
	};

	getCameras = (cb) => {
		let cameras;
		navigator.mediaDevices.enumerateDevices().then((devices) => {
			cameras = devices.filter((device) => {
				return device.kind === 'videoinput';
			});
			cb(cameras);
		});
	};
	startStream = (videoEl, peer) => {
		return new Promise((resolve, reject) => {
			if (videoEl.srcObject === null) {
				navigator.mediaDevices
					.getUserMedia({
						audio: false,
						video: {
							width: 200,
							height: 200
						}
					})
					.then((stream) => {
						videoEl.srcObject = stream;
						this.stream = stream;
						stream.getTracks().forEach((track) => {
							this.track = track;
						});
						resolve();
					});
			} else {
				rejects();
			}
		});
	};

	render() {
		return (
			<div id="session">
				<div id="sessionLeftAside">
					<div id="videoStreams">
						<div className="streamWrap">
							<video id="stream1" autoPlay />
						</div>
						<div className="streamWrap">
							<video className="stream2 stream" autoPlay />
						</div>
						<div className="streamWrap">
							<video className="stream3 stream" autoPlay />
						</div>
						<div className="streamWrap">
							<video className="stream4 stream" autoPlay />
						</div>
						<div className="streamWrap">
							<video className="stream5 stream" autoPlay />
						</div>
						<div className="streamWrap">
							<video className="stream6 stream" autoPlay />
						</div>
					</div>
					<div id="sessionLeftAsideSettings" />
				</div>
				<div id="sessionRightAside">
					<div id="discussContent">{/* <iframe src=""></iframe> */}</div>
					<div id="chatSection">
						{/* 	<video id="videoOfMe" autoPlay /> */}
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
						</div>
					</div>
				</div>
			</div>
		);
	}
}
Session.propTypes = {
	auth: PropTypes.object,
	session: PropTypes.object,
	history: PropTypes.object
};
function stateToProps(state) {
	return {
		auth: state.auth.user,
		session: state.session
	};
}
export default connect(stateToProps)(Session);
