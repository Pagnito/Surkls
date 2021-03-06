import React, { Component } from 'react';
import { connect } from 'react-redux';
import { closeMenus } from 'actions/actions';
import { openDMs } from 'actions/dm-actions';
import { fetchSurkl, updateSurkl, updateOnMembers, updateYTPlayer } from 'actions/surkl-actions';
import { updateMsgs } from 'actions/chat-actions';
import PropTypes from 'prop-types';
import Loader1 from 'components/Loader1/Loader1';
import YTplayer from 'yt-player';
import './surkl.scss';
import ChatBox from '../Reusables/ChatBox/ChatBox';
import Board from './board';


class Surkl extends Component {
	constructor(props) {
		super(props);
		this.state = {
			msg: '',
			membersTab: 'online',
			currTab: 'online',
			time: 0,
			audioState: false,
			linker: false,
			audio_id: '',
			audio_dur: 0,
			audio_time: 0,
			volume: 40,
			sharedImg: ''
		};
	
		this.surklFetched = false;
		this.joinedRoom = false;
		this.resumed = false;
		this.socket = this.props.socket;
		this.audioDataFetcher = 'https://noembed.com/embed?url=https://www.youtube.com/watch?v=';
		this.YTPlayer = null;
		this.ytRendered = false;
		this.socket.on('online-users-n-surkl', (users, surkl, audio_id) => {
			this.props.updateOnMembers(users);
			if(surkl._id!==this.props.surkl.activeSurkl._id){
				this.props.updateSurkl(surkl);
			}		
			fetch(this.audioDataFetcher + audio_id).then((res) => res.json()).then((data) => {
				this.setState({ audioState: false }, () => {
					if (audio_id !== null) {
						this.props.updateYTPlayer({ audio_id: audio_id, artist: data.author_name, title: data.title });
					}
					//this.YTPlayer.load(audio_id,{autoplay:false})
				});
			});
		});
		this.socket.on('track', (track_id) => {
			this.setState({ audio_id: track_id });
			this.pluginAudio(track_id, () => {
			});
		});
		/* this.socket.on('mounted-track', (audio_id) => {
			fetch(this.audioDataFetcher + audio_id).then((res) => res.json()).then((data) => {
				this.setState({ audioState: false }, () => {
					if (audio_id !== null) {
						this.props.updateYTPlayer({ audio_id: audio_id, artist: data.author_name, title: data.title });
					}
					//this.YTPlayer.load(audio_id,{autoplay:false})
				});
			});
		}); */
	}

	componentDidMount() {
		//this.socket.emit('join-surkl-room', this.props.match.params.id);
		if (this.props.surkl.artist !== 'Artist') {
			let currTime = this.props.surkl.currTime;
			let vol = localStorage.getItem('volume');
			let time =
				currTime < 60
					? '0:' + Math.floor(currTime)
					: Math.floor(currTime / 60) +
						':' +
						(Math.floor(currTime % 60) > 9 ? Math.floor(currTime % 60) : '0' + Math.floor(currTime % 60));
			this.setState({ volume: vol, time: time, audio_time: currTime, audio_dur: this.props.surkl.audio_dur });
		} else {
			let vol = localStorage.getItem('volume');
			this.setState({ volume: vol });
		}

		this.props.fetchSurkl(this.props.match.params.id);
		this.socket.emit('get-track', this.props.match.params.id);
	}
	componentWillUnmount() {
		clearInterval(this.timeInterval);
		this.socket.removeListener('track');
		this.socket.removeListener('online-users-n-surkl')
		this.socket.removeListener('mounted-track');
		if(this.YTPlayer!==null){
			this.YTPlayer.pause();
			if (this.props.surkl.currTime === null) {
				this.props.updateYTPlayer({ currTime: this.YTPlayer.getCurrentTime(), audio_dur: this.state.audio_dur });
			}
		}	
	}

	componentDidUpdate(prevProps) {
		if (prevProps.match.params.id !== this.props.match.params.id) {
			this.socket.emit('join-surkl-room', this.props.match.params.id);
		}
		// @TODO Check if user is member of this Surkl
		if (this.props.auth.socket_connected && this.joinedRoom===false) {
			this.joinedRoom = true;
			this.socket.emit('join-surkl-room', this.props.match.params.id);	
		}
	
		if (this.ytRendered === false) {
			let div = document.getElementById('yt-player');
			if (div !== null && div !== undefined) {
				this.renderYTPlayer();
			}
		}
	}
	openDMs = (dm_user) => {
		if (dm_user.user_id !== this.props.auth.user._id) {
			if (this.props.auth.user.dms[dm_user.user_id]) {
				dm_user.thread_id = this.props.auth.user.dms[dm_user.user_id].thread_id;
			}
			delete dm_user._id;
			this.props.openDMs(dm_user, () => {
				this.socket.emit('clear-msg-notifs', this.props.auth.user);
			});
		}
	};
	closeMenus = () => {
		if (this.props.app.menuState === 'open') {
			this.props.closeMenus({ menu: 'close-menus' });
		}
	};
	displayMembers = () => {
		let members = this.props.surkl.members;
		if (members) {
			return (
				<div id="my-surkl-members">
					{members.map((member, ind) => {
						return (
							<div onClick={() => this.openDMs(member)} key={ind} className="surkl-member">
								<div
									className="surkl-member-avatar"
									style={{
										backgroundImage: `url(${member.avatarUrl}`,
										backgroundPosition: 'center',
										backgroundSize: 'cover'
									}}
								/>
								<div className="surkl-member-name">{member.userName}</div>
							</div>
						);
					})}
				</div>
			);
		}
	};
	displayOnlineMembers = () => {
		let members = this.props.surkl.online;
		if (members) {
			return (
				<div id="my-surkl-on-members">
					{members.map((member, ind) => {
						return (
							<div onClick={() => this.openDMs(member)} key={ind} className="surkl-on-member">
								<div className="surkl-name-n-avatar">
									<div
										className="surkl-on-member-avatar"
										style={{
											backgroundImage: `url(${member.avatarUrl}`,
											backgroundPosition: 'center',
											backgroundSize: 'cover'
										}}
									/>
									<div className="surkl-on-member-name">{member.userName}</div>
								</div>
								<div className="surkl-member-on-dot" />
							</div>
						);
					})}
				</div>
			);
		}
	};
	switchMembersTab = (tab, currTab) => {
		document.getElementById(tab).style.color = 'black';
		document.getElementById(tab).style.backgroundColor = '#FFCD44';
		document.getElementById(currTab).style.color = '#F4FBFB';
		document.getElementById(currTab).style.backgroundColor = '#3E3E3E';
		this.setState({ membersTab: tab, currTab: tab });
	};
	renderMembersTab = () => {
		if (this.state.membersTab === 'online') {
			return this.displayOnlineMembers();
		} else {
			return this.displayMembers();
		}
	};
	onInput = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};
	changeVolume = (e) => {
		this.setState({ volume: e.target.value }, () => {
			this.YTPlayer.setVolume(this.state.volume);
			localStorage.setItem('volume', this.state.volume);
		});
	};
	changeTime = (e) => {
		let changed = e.target.value;
		let time =
			changed < 60 ? '0:' + Math.floor(changed) : Math.floor(changed / 60) + ':' + Math.floor(changed % 60);
		this.setState({ time: time, audio_time: changed }, () => {
			this.YTPlayer.seek(changed);
		});
	};

	renderYTPlayer = () => {
		if (this.YTPlayer === null) {
			this.YTPlayer = new YTplayer('#yt-player', {
				height: '0',
				width: '0',
				host: 'https://www.youtube.com',
				related: false
			});
			this.ytRendered = true;
			if (this.props.surkl.audio_id.length > 0) {
				this.YTPlayer.load(this.props.surkl.audio_id);
			}
		} else {
			this.YTPlayer.on('error', (err) => {
				console.log('YT error', err);
			});
		}
	};
	pluginAudio = (audio_id) => {
		if(audio_id.length>5){
		//refactor this fetch to a redux action
			fetch(this.audioDataFetcher + audio_id).then((res) => res.json()).then((data) => {
				if(!('error' in data)){
					this.setState({ linker: false, audioState: true }, () => {
						this.props.updateYTPlayer({ audio_id: audio_id, artist: data.author_name, title: data.title });
						this.YTPlayer.load(audio_id, { autoplay: true });
						this.YTPlayer.on('playing', () => {
							this.YTPlayer.setVolume(this.state.volume);
							this.setState({ audio_dur: this.YTPlayer.getDuration() });
							this.timeInterval = setInterval(() => {
								let currTime = this.YTPlayer.getCurrentTime();
		
								let time =
									currTime < 60
										? '0:' + Math.floor(currTime)
										: Math.floor(currTime / 60) +
											':' +
											(Math.floor(currTime % 60) > 9
												? Math.floor(currTime % 60)
												: '0' + Math.floor(currTime % 60));
								this.setState({ time: time, audio_time: currTime });
							}, 1000);
						});
					});
					this.socket.emit('share-track', audio_id, this.props.surkl.activeSurkl._id);
				}
				
			});
		}	
	};
	pluginAudioOnEnter = (e) => {
		if (e.key === 'Enter') {
			this.pluginAudio(this.state.audio_id);
		}
	};
	playButton = () => {
		if (!this.state.audioState) {
			return <div onClick={this.playOrPause} className="audio-btn" id="play-button" />;
		} else {
			return <div onClick={this.playOrPause} className="audio-btn" id="pause-button" />;
		}
	};
	playOrPause = () => {
		this.setState({ audioState: this.state.audioState ? false : true }, () => {
			if (this.state.audioState === false) {
				this.YTPlayer.pause();
				clearInterval(this.timeInterval);
			} else {
				if (this.props.surkl.justMounted) {
					this.pluginAudio(this.props.surkl.audio_id, () => {});
					this.props.updateYTPlayer({ justMounted: false });
				} else if (this.props.surkl.currTime !== null) {
					this.YTPlayer.setVolume(0);
					this.YTPlayer.play();
					this.YTPlayer.on('playing', () => {
						if (this.resumed === false) {
							this.resumed = true;
							this.YTPlayer.setVolume(this.state.volume);
							this.YTPlayer.seek(this.props.surkl.currTime);
							this.props.updateYTPlayer({ currTime: null });
							this.setState({ audio_dur: this.YTPlayer.getDuration() });
							this.timeInterval = setInterval(() => {
								let currTime = this.YTPlayer.getCurrentTime();
								let time =
									currTime < 60
										? '0:' + Math.floor(currTime)
										: Math.floor(currTime / 60) +
											':' +
											(Math.floor(currTime % 60) > 9
												? Math.floor(currTime % 60)
												: '0' + Math.floor(currTime % 60));
								this.setState({ time: time, audio_time: currTime });
							}, 1000);
						}
					});
				} else {
					this.YTPlayer.play();
				}
			}
		});
	};
	toggleLinkerModal = () => {
		this.setState({ linker: this.state.linker ? false : true });
	};
	linkerModal = () => {
		if (this.state.linker) {
			return (
				<div id="linker-modal">
					<img id="link-guide" src="/assets/link-guide.png" />
					<div id="input-n-btn">
						<input
							onKeyDown={this.pluginAudioOnEnter}
							value={this.state.audio_id}
							onChange={this.onInput}
							placeholder="Copy video id here"
							id="audio-link-id"
							name="audio_id"
						/>
						<div onClick={this.toggleLinkerModal} id="linker-cancel-btn" />
						<div onClick={()=>this.pluginAudio(this.state.audio_id)} id="linker-play-btn" />
					</div>
				</div>
			);
		} else {
			return '';
		}
	};

displayAudioLinker = () =>{
		let surkl = this.props.surkl.activeSurkl
		if(surkl){
			if(surkl.admin){
				return (
					<div style={{
					display: this.props.surkl.activeSurkl.admin.user_id===this.props.auth.user._id ? 'block' : 'none'}} 
					onClick={this.toggleLinkerModal} id="audio-player-linker" />
				)
			}	
		}
	}

	render() {
		if (this.props.auth.user === null) {
			return <Loader1 />;
		}
		if (this.props.auth.isAuthenticated) {
			return (
				<div onClick={this.closeMenus} id="surkl">
					<Board />
					<section id="surkl-center">
						<ChatBox match={this.props.match} socket={this.socket} type={'surkl'} />
					</section>
					<section id="surkl-members">
						<div id="surkl-members-header">
							{this.props.surkl.activeSurkl.name}
							<div id="member-tab-btns">
								<div
									onClick={() => this.switchMembersTab('online', this.state.currTab)}
									id="online"
									className="members-tab-btn surkl-on-tab"
								>
									Online
								</div>
								<div
									onClick={() => this.switchMembersTab('all', this.state.currTab)}
									id="all"
									className="members-tab-btn surkl-all-tab"
								>
									All
								</div>
							</div>
						</div>
						{this.renderMembersTab()}
						<div id="audio-player">
							<div id="yt-player" />
							<div id="player-navs">
								{this.playButton()}
								<div className="track-info-item track-time">
									{this.state.time === 0 ? '0:00' : this.state.time}
								</div>
								<input
									min="0"
									onChange={this.changeTime}
									max={this.state.audio_dur}
									value={this.state.audio_time}
									id="audio-time-range"
									type="range"
								/>
								<div id="volume-icon">
									<div id="rotator">
										<input
											onChange={this.changeVolume}
											value={this.state.volume}
											type="range"
											orient="vertical"
											id="audio-volume-range"
											min="0"
											max="100"
										/>
									</div>
								</div>
							</div>
							<div id="restof-player">
								<div id="track-info">
									<div className="track-info-item">
										{this.props.surkl.title.length > 60 ? (
											this.props.surkl.title.slice(0, 60) + '...'
										) : (
											this.props.surkl.title
										)}
									</div>
									<div className="track-info-item">{this.props.surkl.artist}</div>
								</div>
								{this.displayAudioLinker()}
								{this.linkerModal()}
							</div>
						</div>
					</section>
				</div>
			);
		} else {
			return <div id="notLoggedIn">You are not logged in</div>;
		}
	}
}
Surkl.propTypes = {
	auth: PropTypes.object,
	closeMenus: PropTypes.func,
	app: PropTypes.object,
	fetchSurkl: PropTypes.func,
	surkl: PropTypes.object,
	socket: PropTypes.object,
	match: PropTypes.object,
	updateMsgs: PropTypes.func,
	updateOnMembers: PropTypes.func,
	openDMs: PropTypes.func,
	updateYTPlayer: PropTypes.func,
	dms: PropTypes.object,
	updateSurkl: PropTypes.func
};
function stateToProps(state) {
	return {
		auth: state.auth,
		app: state.app,
		surkl: state.surkl,
		dms: state.dms
	};
}
export default connect(stateToProps, {
	closeMenus,
	fetchSurkl,
	updateMsgs,
	updateOnMembers,
	openDMs,
	updateYTPlayer,
	updateSurkl
})(Surkl);
