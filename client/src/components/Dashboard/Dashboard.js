import React, { Component } from 'react';
import { connect } from 'react-redux';
import { closeMenus } from 'actions/actions';
import { openDMs } from 'actions/dm-actions';
import { fetchMySurkl, updateMsgs, updateOnMembers } from 'actions/surkl-actions';
import PropTypes from 'prop-types';
import Loader1 from 'components/Loader1/Loader1';
import YTplayer from 'yt-player';
import './dashboard.scss';

class Dashboard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			msg: '',
			membersTab: 'online',
			currTab: 'online'
		};
		this.surklFetched = false;
		this.joinedRoom = false;
		this.socket = this.props.socket;
		this.dataReceived = false;
		this.apiKeys = [
			'AIzaSyDws9NT1IvkAYPH98VYsIKFXffKNVmU-Jc',
			'AIzaSyC-NVEgdByg61B92oFIbXkWBm-mqrW6FwU',
			'AIzaSyBYjnyqxqjLo5B5cJjlo-KkEzQYLp6dqPE',
			'AIzaSyAPW2QscyTsEPKUzDgEpR321HEouBt7A2o',
			'AIzaSyAGfR5YzyHv7_nXDqy3djJfYEs-NIVXiik',
			'AIzaSyCRwoKB-wr5Sc0OhN4sD7yY_oZuV5UN_es',
			'AIzaSyAh_DJv3EwDi7ROzvzY35zqEFFh433sHMs',
			'AIzaSyDE03mlW16M0wP6KzjX7jTJbl4mevEDoNo'
		];
		this.YTapi =
			'https://www.googleapis.com/youtube/v3/search?&relevanceLanguage=en&regionCode=US&publishedAfter=2017-01-01T00:00:00Z&part=snippet&order=date&maxResults=30';
		this.onMountYTapi =
			'https://www.googleapis.com/youtube/v3/videos?&relevanceLanguage=en&regionCode=US&publishedAfter=2017-01-01T00:00:00Z&part=snippet&order=date&maxResults=50&chart=mostPopular&key=AIzaSyDE03mlW16M0wP6KzjX7jTJbl4mevEDoNo';
		this.YTurl = 'https://www.youtube.com/embed/';
		this.YTPlayer = null;
		this.keyInd = 0;
		this.socket.on('receive-surkl-msgs', (msgs) => {
			this.props.updateMsgs(msgs);
		});
		this.socket.on('online-users', (users) => {
			this.props.updateOnMembers(users);
		});
	}

	componentDidMount() {
		this.props.fetchMySurkl(this.props.match.params.id);
	}
	openDMs = (dm_user) => {
		if (dm_user.user_id !== this.props.auth.user._id) {
			if (this.props.auth.user.dms[dm_user.user_id]) {
				dm_user.thread_id = this.props.auth.user.dms[dm_user.user_id].thread_id;
			}
			delete dm_user._id;
			this.props.openDMs(dm_user, (user) => {
				this.socket.emit('clear-msg-notifs', user);
			});
		}
	};
	componentDidUpdate(prevProps) {
		if (prevProps.auth !== this.props.auth && this.props.auth.user.mySurkl) {
			if (this.props.auth.user.mySurkl.motto && !this.dataReceived) {
				this.dataReceived = true;
				this.joinSurklRoom();
			}
		}
		if (this.props.surkl.msgs !== prevProps.surkl.msgs) {
			const chatBox = document.getElementById('surkl-feed');
			if (chatBox !== null) {
				chatBox.scrollTop = chatBox.scrollHeight;
			}
		}
	}
	closeMenus = () => {
		if (this.props.app.menuState === 'open') {
			this.props.closeMenus({ menu: 'close-menus' });
		}
	};
	displayMembers = () => {
		let members = this.props.surkl.mySurkl.members;
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
	joinSurklRoom = () => {
		this.socket.emit('join-surkl-room', this.props.match.params.id, this.props.auth.user);
	};
	sendSurklMsg = (e) => {
		if (e.key == 'Enter') {
			e.preventDefault();
			let msg = {
				msg: this.state.msg,
				userName: this.props.auth.user.userName,
				avatarUrl: this.props.auth.user.avatarUrl,
				surkl_id: this.props.match.params.id,
				date: Date.now()
			};
			this.setState({ msg: '' });
			this.socket.emit('surkl-msg', msg);
		}
	};

	onInput = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};

	displayMsgs = () => {
		return this.props.surkl.msgs.map((msg, ind) => {
			let url = msg.avatarUrl ? msg.avatarUrl : '/assets/whitehat.jpg';
			return (
				<div key={ind} className="surkl-chat-msg">
					<img data-user={JSON.stringify(msg)} className="surkl-chat-msgAvatar" src={url} />
					<div className="surkl-chat-HeaderNmsg">
						<div className="surkl-chat-MsgUserInfo">
							<div className="surkl-chat-MsgName">{msg.userName}</div>
							<div className="surkl-chat-MsgDate">{msg.date}</div>
						</div>
						<div className="surkl-chat-MsgText">{msg.msg}</div>
					</div>
				</div>
			);
		});
	};

	render() {
		if (this.props.auth.user === null) {
			return <Loader1 />;
		}
		if (this.props.auth.isAuthenticated) {
			return (
				<div onClick={this.closeMenus} id="surkl">
					<section id="newsSources">
						<div id="newsSourcesHeader">Sessions</div>
						<div id="newsSourcesFeed" />
					</section>
					<section id="surkl-center">
						<div id="feedInputs">
							{/* <input onChange={this.onInputChange} onKeyDown={this.onEnter} value={this.props.surkl.search1} id="dashSearch1" className="dashSearch" name="search1" placeholder="Subscribe to a topic"/>*/}
						</div>
						<div id="surkl-feed">{this.displayMsgs()}</div>
						<textarea
							value={this.state.msg}
							onChange={this.onInput}
							onKeyDown={this.sendSurklMsg}
							name="msg"
							placeholder="Type here to chat"
							id="surkl-chat-input"
						/>
					</section>
					<section id="surkl-members">
						<div id="surkl-members-header">
							My Surkl
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
						<div id="audio-player" />
					</section>
				</div>
			);
		} else {
			return <div id="notLoggedIn">You are not logged in</div>;
		}
	}
}
Dashboard.propTypes = {
	auth: PropTypes.object,
	updateDashboard: PropTypes.func,
	closeMenus: PropTypes.func,
	app: PropTypes.object,
	fetchMySurkl: PropTypes.func,
	surkl: PropTypes.object,
	socket: PropTypes.object,
	match: PropTypes.object,
	updateMsgs: PropTypes.func,
	updateOnMembers: PropTypes.func,
	openDMs: PropTypes.func
};
function stateToProps(state) {
	return {
		auth: state.auth,
		app: state.app,
		surkl: state.surkl
	};
}
export default connect(stateToProps, { closeMenus, fetchMySurkl, updateMsgs, updateOnMembers, openDMs })(Dashboard);
