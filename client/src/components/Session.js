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
				}
			]
		};
		this.isInitiator = false;
		this.stream;
		this.clients = 0;
		this.rtcPeer = new webkitRTCPeerConnection(this.stunConfig);
		this.socket = io('http://localhost:4000');
		this.socket.on('connect', () => {
			this.setState({ connectedToSock: true });
		});
		this.socket.on('recieveMsgs', (data) => {
			this.setState({ msgs: data });
		});
	}
handleRemoteStreamAdded=(event)=> {
		console.log('Remote stream added.', event.stream);
		document.querySelector('.stream2').srcObject = event.streams[0];
	}
handleIceCandidate =(event)=> {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
    let candidate = {
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
		};
		this.socket.emit('candidate', candidate)
  } else {
    console.log('End of candidates.');
  }
}
	createOffer = () => {
		console.log('Creating Offer');
		this.rtcPeer.createOffer().then(
			(offer) => {
				console.log('Created Offer', offer);
				this.socket.emit('offer', offer);
				return this.rtcPeer.setLocalDescription(new RTCSessionDescription(offer));
			},
			(err) => {
				console.log('Error with creating offer ', err);
			}
		);
	};
	createAnswer = () => {
		console.log('Creating answer');
		this.rtcPeer.createAnswer().then(
			(answer) => {
				console.log('Created answer', answer);
				this.socket.emit('answer', answer);
				return this.rtcPeer.setLocalDescription(new RTCSessionDescription(answer),()=>{
					console.log(this.rtcPeer)
				});
			},
			(err) => {
				console.log('Error with creating answer ', err);
			}
		);
	};
	componentWillUnmount() {
		let stream = document.getElementById('stream1').srcObject;
		if(stream!==null){
			let tracks = stream.getTracks();
			tracks.forEach(function(track) {
				track.stop();
			});
		}
		document.getElementById('stream1').srcObject = null;
		this.socket.emit('leave', this.props.session.session);
	}
	componentDidMount() {
		this.socket.on('candidate', candidate=>{
			var hisCandidate = new RTCIceCandidate({
				sdpMLineIndex: candidate.label,
				candidate: candidate.candidate
			});
			this.rtcPeer.addIceCandidate(hisCandidate);
		})
		this.rtcPeer.onicecandidate = this.handleIceCandidate;
		this.rtcPeer.ontrack = this.handleRemoteStreamAdded;
    /* this.rtcPeer.onremovestream = handleRemoteStreamRemoved; */
		setUserMedia();
		if (this.props.session.creatingSession===true) {
			
			this.socket.emit('createOrJoin', this.props.session);
			console.log('Creating Socket Room');
			this.startStream(document.getElementById('stream1'));
			console.log('Local Stream Started');
			this.socket.on('newJoin', (data) => {
				console.log(data)
				this.isInitiator = true;
				this.createOffer();
			});
			this.socket.on('answer', (answer) => {
				console.log('recieved answer', answer);
				this.rtcPeer.setRemoteDescription(new RTCSessionDescription(answer, ()=>{
					console.log('set remote desc')
				}))
			});
		} else if(this.props.session.inSession) {
			this.socket.emit('createOrJoin', this.props.session);
			console.log('Joined Socket Room');
			this.startStream(document.getElementById('stream1'));
			console.log('Local Stream Started');
			this.socket.on('offer', (offer) => {
				console.log(offer)
				console.log('Setting Remote Description');
				this.rtcPeer.setRemoteDescription(new RTCSessionDescription(offer),()=>{
					this.createAnswer()
				})			
			});
		}
	}
	componentDidUpdate(prevProps) {
		if (prevProps.session !== this.props.session) {
			if (this.props.session.creatingSession) {
				this.socket.emit('createOrJoin', this.props.session.session);
				console.log('Creating Socket Room');
				this.startStream(document.getElementById('stream1'));
				console.log('Local Stream Started');
				this.socket.on('newJoin', (data) => {
					console.log(data)
					this.isInitiator = true;
					this.createOffer();
				});
				this.socket.on('answer', (answer) => {
					console.log('recieved answer', answer);
					this.rtcPeer.setRemoteDescription(new RTCSessionDescription(answer), ()=>{
						console.log('set remote desc')
						console.log(this.rtcPeer)
					})
				});
			} else if(this.props.session.inSession){
				this.socket.emit('createOrJoin', this.props.session.session);
				console.log('Joined Socket Room');
				this.startStream(document.getElementById('stream1'));
				console.log('Local Stream Started');
				this.socket.on('offer', (offer) => {
					console.log(offer)
					console.log('Setting Remote Description');
					this.rtcPeer.setRemoteDescription(new RTCSessionDescription(offer),()=>{
						this.createAnswer()
					})			
				});
			}
		}
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
	startStream = (videoEl, cb) => {
		navigator.mediaDevices
			.getUserMedia({
				audio: false,
				video: {
					width: 200,
					height: 200
				}
			})
			.then((stream) => {
				stream.getTracks().forEach(track=>{
					this.rtcPeer.addTrack(track,stream)
				})
				this.stream = stream;
				videoEl.srcObject = stream;
			});
	};


	render() {
		return (
			<div id="session">
				<div id="sessionLeftAside">
					<div id="videoStreams">
						<div className="streamWrap">
							<video id="stream1" className="stream1 stream" autoPlay />
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
