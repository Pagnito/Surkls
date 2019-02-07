import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import DropMenu from 'components/smalls/drop-menu';
import Pullout from 'components/Header/Pullout-menu';
import { startSession, joinSession, signUpOrLogin, getDevices } from 'actions/actions';
import { subCategories } from 'components/smalls/sub-categories';
import 'styles/header.scss';
class Header extends Component {
	constructor(props) {
		super(props);
		this.state = {
			maxMembers: 3,
			maxViewers: 10,
			category: '',
			subCategory: '',
			roomName: '',
			accMenuVisible: false,
			notifMenuVisible: false,
			sessionMenuVisible: false,
			signInMenuVisible: false,
			pulloutMenuVisible: false,
			email: '',
			password: '',
			message: ''
		};
	}

	componentDidMount() {
		this.props.getDevices();
	}
	onInputChange = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};
	onCheckbox = (e) => {
		this.setState({ [e.target.name]: this.state.disableAud == 'off' ? 'on' : 'off' });
	};
	renderAccMenu = () => {
		this.setState({
			accMenuVisible: this.state.accMenuVisible ? false : true,
			notifMenuVisible: false,
			sessionMenuVisible: false,
			pulloutMenuVisible: false,
			signInMenuVisible: false,
			messagesMenuVisible: false
		});
	};
	renderNotifMenu = () => {
		this.setState({
			notifMenuVisible: this.state.notifMenuVisible ? false : true,
			accMenuVisible: false,
			sessionMenuVisible: false,
			pulloutMenuVisible: false,
			signInMenuVisible: false,
			messagesMenuVisible: false
		});
	};
	renderCreateSessionMenu = () => {
		if (window.location.pathname.indexOf('/session') < 0) {
			this.setState(
				{
					sessionMenuVisible: this.state.sessionMenuVisible ? false : true,
					accMenuVisible: false,
					notifMenuVisible: false,
					pulloutMenuVisible: false,
					signInMenuVisible: false,
					messagesMenuVisible: false,
					roomCategory: this.state.sessionMenuVisible ? this.state.roomCategory : '',
					roomName: this.state.sessionMenuVisible ? this.state.roomName : ''
				},
				() => {
					document.getElementById('sessionNameInput').focus();
				}
			);
		}
	};
	renderMessagesMenu = () => {
		this.setState({
			messagesMenuVisible: this.state.messagesMenuVisible ? false : true,
			accMenuVisible: false,
			notifMenuVisible: false,
			pulloutMenuVisible: false,
			signInMenuVisible: false,
			sessionMenuVisible: false
		});
	};
	renderSignInMenu = () => {
		this.setState({
			signInMenuVisible: this.state.signInMenuVisible ? false : true,
			threeDotMenuVisible: false
		});
	};
	renderThreeDotMenu = () => {
		this.setState({
			threeDotMenuVisible: this.state.threeDotMenuVisible ? false : true,
			signInMenuVisible: false
		});
	};

	hideAllMenus = () => {
		this.setState({
			sessionMenuVisible: false,
			accMenuVisible: false,
			notifMenuVisible: false,
			pulloutMenuVisible: false,
			signInMenuVisible: false,
			threeDotMenuVisible: false
		});
	};
	hideSignInMenu = () => {
		this.setState({ signInMenuVisible: false });
	};
	renderPulloutMenu = () => {
		let bg = document.getElementById('pulloutBg');
		let menu = document.getElementById('pullout');
		if (this.state.pulloutMenuVisible === false) {
			bg.style.display = 'block';
			bg.classList.remove('removeOverlay');
			menu.classList.remove('pullinAction');
			bg.classList.add('overlayAction');
			menu.classList.add('pulloutAction');

			this.setState({
				pulloutMenuVisible: true,
				accMenuVisible: false,
				notifMenuVisible: false,
				sessionMenuVisible: false
			});
		} else {
			bg.classList.remove('overlayAction');
			menu.classList.remove('pulloutAction');
			this.setState({ pulloutMenuVisible: false });
			setTimeout(() => {
				bg.style.display = 'none';
			}, 300);
		}
	};

	pulloutMenu = () => {
		return (
			<Pullout pullIn={this.renderPulloutMenu}>
				<div className="customPulloutHeader">
					<div onClick={this.renderPulloutMenu} id="menuBarsIcon2" />
					<img id="surklsTitle" src="/assets/surkls_title.png" />
				</div>
				<Link to="/rooms" className="menuItem">
					<div className="threeDotMenuIcon" id="roomsIcon" />Rooms
				</Link>
				<div className="menuItem">
					<div className="threeDotMenuIcon" id="surklsIcon" />Surkls
				</div>
				<div className="menuItem">
					<div className="threeDotMenuIcon" id="helpIcon" />Streams
				</div>
				<div className="menuItem">
					<div className="threeDotMenuIcon" id="aboutIcon" />People
				</div>
				<div className="menuItem">
					<div className="threeDotMenuIcon" id="aboutIcon" />Events
				</div>
				<div className="menuSurkls">
					<div className="menuSurklsHeader">Surkls</div>
				</div>
			</Pullout>
		);
	};
	notifMenu = () => {
		let visibility = this.state.notifMenuVisible ? 'flex' : 'none';
		return (
			<DropMenu
				hideMenu={this.hideAllMenus}
				visibility={visibility}
				menuTypeArrow="notifArrow"
				menuTitle="Notifications"
			>
				<div>Hello</div>
				<div />
			</DropMenu>
		);
	};

	messagesMenu = () => {
		let visibility = this.state.messagesMenuVisible ? 'flex' : 'none';
		return (
			<DropMenu menuTitle="Messages" visibility={visibility} menuTypeArrow="messagesArrow">
				<textarea
					onChange={this.onInputChange}
					placeholder="Write your message"
					className="menuTextInput"
					name="message"
					value={this.state.message}
				/>

				<button onClick={this.createSession} className="menuItem" id="sendMsgBtn">
					Create
				</button>
			</DropMenu>
		);
	};
	feedCamOptions = () => {
		return this.props.devices.devices.cams.map((cam, ind) => {
			return (
				<option name="cam" key={ind} value={cam.deviceId} className="option">
					{cam.label.length>0 ? cam.label : '(Default)'}
				</option>
			);
		});
	};
	feedMicOptions = () => {
		return this.props.devices.devices.mics.map((mic, ind) => {
			return (
				<option name="mic" key={ind} value={mic.deviceId} className="option">
					{mic.label.length>0 ? mic.label : '(Default)'}
				</option>
			);
		});
	};
	populateSubCategories = () => {
		if (this.state.category === 'gaming') {
			return subCategories.gaming.map((cat, ind) => {
				return (
					<option key={ind} value={cat}>
						{cat}
					</option>
				);
			});
		} else if (this.state.category === 'music') {
			return subCategories.music.map((cat, ind) => {
				return (
					<option key={ind} value={cat}>
						{cat}
					</option>
				);
			});
		} else if (this.state.category === 'sports') {
			return subCategories.sports.map((cat, ind) => {
				return (
					<option key={ind} value={cat}>
						{cat}
					</option>
				);
			});
		}
	};
	renderSubCategories = () => {
		let visible = (this.state.category === 'sports' || 
										 this.state.category === 'gaming' ||
										 this.state.category === 'music') ? 'block' : 'none'
		return (
			<select
				onChange={this.onInputChange}
				name="subCategory"
				style={{display:visible, marginTop: '10px', marginBottom: '5px' }}
				id="subCategory"
				className="menuSelect"
			>
				{this.populateSubCategories()}
			</select>
		);
	};
	createSessionMenu = () => {
		let visibility = this.state.sessionMenuVisible ? 'flex' : 'none';
		return (
			<DropMenu menuTitle="Create Session" visibility={visibility} menuTypeArrow="sessionArrow">
				<input
					id="sessionNameInput"
					onChange={this.onInputChange}
					placeholder="Name your session"
					className="menuInput"
					name="roomName"
					value={this.state.roomName}
				/>
				<select
					onChange={this.onInputChange}
					name="category"
					style={{ marginTop: '10px', marginBottom: '5px' }}
					id="categorySelect"
					className="menuSelect"
				>
					<option value="">Category</option>
					<option value="gaming">Gaming</option>
					<option value="music">Music</option>
					<option value="joe+rogan">Joe Rogan</option>
					<option value="trending">Trending</option>
					<option value="animal">Animals</option>
					<option value="food">Food</option>
					<option value="travel">Travel</option>
					<option value="politics">Politics</option>
					<option value="entertainment">Entertainment</option>
					<option value="sports">Sports</option>
					<option value="entrepreneurship">Entrepreneurship</option>
					<option value="religion">Religion</option>
					<option value="spirituality">Spirituality</option>
					<option value="business">Business</option>
					<option value="health">Health</option>
					<option value="fashion">Fashion</option>
					<option value="cars">Cars</option>
					<option value="movies">Movies</option>
					<option value="technology">Technology</option>
					<option value="other">I want it all</option>
				</select>
				{this.renderSubCategories()}
				<div className="menuConfig">
					Max Members
					<input
						id="maxMembers"
						onChange={this.onInputChange}
						value={this.state.maxMembers}
						className="sessionConfig"
						type="number"
						name="maxMembers"
						min="2"
						max="3"
					/>
				</div>
			{/* 	<div className="menuConfig">
					Max Viewers
					<input
						id="maxViewers"
						onChange={this.onInputChange}
						value={this.state.maxViewers}
						className="sessionConfig"
						type="number"
						name="maxViewers"
						min="1"
						max="10"
					/>
				</div> */}

				<div className="audioInputs menuConfig">Audio inputs</div>
				<select id="micSelect" className="menuSelect">
					{this.feedMicOptions()}
				</select>
				<div className="videoInputs menuConfig">Video inputs</div>
				<select id="camSelect" className="menuSelect">
					{this.feedCamOptions()}
				</select>
				<button onClick={this.createSession} className="menuItem" id="createSessBtn">
					Create
				</button>
			</DropMenu>
		);
	};
	login = (e) => {
		e.preventDefault();
		let user = {
			email: this.state.email,
			password: this.state.password
		};

		this.props.signUpOrLogin(JSON.stringify(user), () => {
			this.setState({ signInMenuVisible: false });
			this.props.history.push('/rooms');
		});
	};
	signInMenu = () => {
		let visibility = this.state.signInMenuVisible ? 'flex' : 'none';
		return (
			<DropMenu menuTitle="Log in with" menuTypeArrow="signInArrow" visibility={visibility}>
				<a onClick={this.hideSignInMenu} href="/auth/google" className="menuItem signInGoogleWrap">
					<div className="signInMenuIcon" id="signInGoogleIcon" /> Google
				</a>
				<a onClick={this.hideSignInMenu} href="/auth/twitter" className="menuItem signInTwitterWrap">
					<div className="signInMenuIcon" id="signInTwitterIcon" /> Twitter
				</a>
				<a onClick={this.hideSignInMenu} href="/auth/twitch" className="menuItem signInTwitchWrap">
					<div className="signInMenuIcon" id="signInTwitchIcon" /> Twitch
				</a>
				<div className="menuItemSplit">
					<div className="splitLine1" />
					<div className="or">OR</div>
					<div className="splitLine2" />
				</div>
				<form onSubmit={this.login} id="signInForm">
					<input
						onChange={this.onInputChange}
						className="signInEmail signInInput"
						name="email"
						value={this.state.email}
						placeholder="email"
						type="email"
					/>
					<input
						onChange={this.onInputChange}
						className="signInPassword signInInput"
						type="password"
						name="password"
						value={this.state.password}
						placeholder="password"
					/>
					<button className="loginBtn">Log In</button>
				</form>
			</DropMenu>
		);
	};
	threeDotMenu = () => {
		let visibility = this.state.threeDotMenuVisible ? 'flex' : 'none';
		return (
			<DropMenu
				hideMenu={this.hideAllMenus}
				menuTitle="Menu"
				menuTypeArrow="threeDotArrow"
				visibility={visibility}
			>
				<div id="themeWidget">
					<div id="themePicker" />
				</div>

				<Link to="/rooms" className="menuItem">
					<div className="threeDotMenuIcon" id="roomsIcon" />Rooms
				</Link>
				<div className="menuItem">
					<div className="threeDotMenuIcon" id="surklsIcon" />Surkls
				</div>
				<div className="menuItem">
					<div className="threeDotMenuIcon" id="helpIcon" />Help
				</div>
				<div className="menuItem">
					<div className="threeDotMenuIcon" id="aboutIcon" />About
				</div>
			</DropMenu>
		);
	};
	accountMenu = () => {
		let visibility = this.state.accMenuVisible ? 'flex' : 'none';
		return (
			<DropMenu
				hideHeader={true}
				hideMenu={this.hideAllMenus}
				menuTypeArrow="accountArrow"
				visibility={visibility}
			>
				<div className="customMenuHeader">
					<div
						id="avatar"
						style={{
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat',
							backgroundSize: 'cover',
							backgroundImage: `url(${this.props.auth.user.avatarUrl})`
						}}
					/>
					<div id="userNameNEmail">
						<div>
							<span style={{ fontSize: '18px' }}>{this.props.auth.user.userName}</span>
						</div>
						<div>
							<span style={{ fontSize: '15px' }}>{this.props.auth.user.email}</span>
						</div>
					</div>
				</div>
				<div id="themeWidget">
					<div id="themePicker" />
				</div>
				<div className="menuItem">
					<div className="rightAccIcon" id="surklsIcon" />My Surkls
				</div>
				<div className="menuItem">
					<div className="rightAccIcon" id="profileIcon" />Profile
				</div>
				<div className="menuItem">
					<div className="rightAccIcon" id="settingsIcon" />Settings
				</div>
				<div className="menuItem">
					<div className="rightAccIcon" id="helpIcon" />Help
				</div>
				<a className="menuItem" href="/auth/logout">
					<div className="rightAccIcon" id="logoutIcon" />Log Out
				</a>
			</DropMenu>
		);
	};

	createSession = () => {
		if (this.state.roomName.length >= 3 && window.location.pathname.indexOf('/session') < 0) {
			let sessionKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
			//let clientId = Math.random().toString(16).substring(2, 15) + Math.random().toString(16).substring(2, 15);
			let sessionObj = {
				room: this.state.roomName,
				sessionKey: sessionKey,
				maxMembers: this.state.maxMembers,
				category: this.state.category,
				subCategory: this.state.subCategory,
				isAdmin: true,
				notShareLink: true,
				cam: document.getElementById('camSelect').value
					? document.getElementById('camSelect').value
					: 'default',
				mic: document.getElementById('micSelect').value ? document.getElementById('micSelect').value : 'default'
			};
			this.setState(
				{
					sessionMenuVisible: false,
					roomName: ''
				},
				() => {
					this.props.startSession(sessionObj, () => {
						this.props.history.push('/session/room=' + sessionKey.toString());
					});
				}
			);
		} else {
			//@TODO show error
		}
	};
	render() {
		if (!this.props.auth.isAuthenticated) {
			return (
				<div className="header">
					{this.pulloutMenu()}
					{/* //////////////section///////////*/}
					<div id="leftOfHeader">
						{<div onClick={this.renderPulloutMenu} id="menuBarsIcon" />}
						<Link to="/rooms">
							<img className="logo" src="/assets/surkls-logo2.png" />
						</Link>
					</div>
					{/* //////////////section///////////*/}
					<div id="centerOfHeader" />
					{/* //////////////section///////////*/}
					<div id="rightOfHeader">
						{this.signInMenu()}
						{this.threeDotMenu()}
						<div onClick={this.renderSignInMenu} id="signInText">
							Sign In
						</div>
						<div onClick={this.renderThreeDotMenu} id="threeDotsMenu" />
					</div>
					{/* //////////////section///////////*/}
				</div>
			);
		} else {
			return (
				<div className="header">
					{this.pulloutMenu()}
					{/* //////////////section///////////*/}
					<div id="leftOfHeader">
						{<div onClick={this.renderPulloutMenu} id="menuBarsIcon" />}
						<Link to="/rooms">
							<img className="logo" src="/assets/surkls-logo2.png" />
						</Link>
					</div>
					{/* //////////////section///////////*/}
					<div id="centerOfHeader" />
					{/* //////////////section///////////*/}
					<div id="rightOfHeader">
						{this.accountMenu()}
						{this.notifMenu()}
						{this.createSessionMenu()}
						{this.messagesMenu()}
						<div onClick={this.renderCreateSessionMenu} id="startSessionIcon" />
						<div onClick={this.renderMessagesMenu} id="messageIcon" />
						<div onClick={this.renderNotifMenu} id="notifIcon" />
						<div
							onClick={this.renderAccMenu}
							id="avatar"
							style={{
								backgroundPosition: 'center',
								backgroundRepeat: 'no-repeat',
								backgroundSize: 'cover',
								backgroundImage: `url(${this.props.auth.user.avatarUrl})`
							}}
						/>
					</div>
					{/* //////////////section///////////*/}
				</div>
			);
		}
	}
}
Header.propTypes = {
	auth: PropTypes.object,
	history: PropTypes.object,
	startSession: PropTypes.func,
	joinSession: PropTypes.func,
	signUpOrLogin: PropTypes.func,
	devices: PropTypes.object,
	getDevices: PropTypes.func
};
function stateToProps(state) {
	return {
		auth: state.auth,
		devices: state.devices
	};
}
export default connect(stateToProps, { startSession, joinSession, signUpOrLogin, getDevices })(withRouter(Header));
