import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import DropMenu from 'components/smalls/drop-menu';
import Pullout from 'components/Header/Pullout-menu';
import io from 'socket.io-client';
import { startSession, joinSession, signIn, getDevices, toggleMenu, closeMenus } from 'actions/actions';
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
			email: '',
			password: '',
			message: ''
		};
		this.menusClosed = true;
	
	}

	componentDidMount() {
		this.props.getDevices();
	}
	componentDidUpdate(){
		if(this.props.app.menu==='close-menus' && this.menusClosed === false){		
			this.hideAllMenus()
			this.menusClosed=true;
		}
	}
	onInputChange = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};
	onCheckbox = (e) => {
		this.setState({ [e.target.name]: this.state.disableAud == 'off' ? 'on' : 'off' });
	};
	renderAccMenu = () => {
		this.menusClosed=false;
		this.props.toggleMenu({accMenuVisible: this.props.app.accMenuVisible ? false : true,
			notifMenuVisible: false,
			sessionMenuVisible: false,
			pulloutMenuVisible: false,
			signInMenuVisible: false,
			messagesMenuVisible: false,
			menuState: 'open'
		})
	};
	renderNotifMenu = () => {
		this.menusClosed=false;
		this.props.toggleMenu({
			notifMenuVisible: this.props.app.notifMenuVisible ? false : true,
			accMenuVisible: false,
			sessionMenuVisible: false,
			pulloutMenuVisible: false,
			signInMenuVisible: false,
			messagesMenuVisible: false,
			menuState: 'open'
		});
	};
	renderCreateSessionMenu = () => {
		this.menusClosed=false;
		if (window.location.pathname.indexOf('/session') < 0) {
			this.props.toggleMenu(
				{
					sessionMenuVisible: this.props.app.sessionMenuVisible ? false : true,
					accMenuVisible: false,
					notifMenuVisible: false,
					pulloutMenuVisible: false,
					signInMenuVisible: false,
					messagesMenuVisible: false,
					roomCategory: this.state.sessionMenuVisible ? this.state.roomCategory : '',
					roomName: this.state.sessionMenuVisible ? this.state.roomName : '',
					menuState: 'open'
				},
				() => {
					document.getElementById('sessionNameInput').focus();
				}
			);
		}
	};
	renderMessagesMenu = () => {
		this.menusClosed=false;
		this.props.toggleMenu({
			messagesMenuVisible: this.props.app.messagesMenuVisible ? false : true,
			accMenuVisible: false,
			notifMenuVisible: false,
			pulloutMenuVisible: false,
			signInMenuVisible: false,
			sessionMenuVisible: false,
			menuState: 'open'
		});
		fetch('/api/connect').then(()=>{
			this.socket = io('http://localhost:4000');
			this.socket.on('connect', ()=>{
				console.log('sup homes')
			})
		})
	};
	renderSignInMenu = () => {
		this.menusClosed=false;
		this.props.toggleMenu({
			signInMenuVisible: this.props.app.signInMenuVisible ? false : true,
			threeDotMenuVisible: false,
			menuState: 'open'
		});
	};
	renderThreeDotMenu = () => {
		this.menusClosed=false;
		this.props.toggleMenu({
			threeDotMenuVisible: this.props.app.threeDotMenuVisible ? false : true,
			signInMenuVisible: false,
			menuState: 'open'
		});
	};

	hideAllMenus = () => {
		this.props.closeMenus({
			sessionMenuVisible: false,
			accMenuVisible: false,
			notifMenuVisible: false,
			pulloutMenuVisible: false,
			signInMenuVisible: false,
			threeDotMenuVisible: false,
			messagesMenuVisible:false,
			menuState:'closed',
			menu: 'rdy-to-open'
		});
	};
	hideSignInMenu = () => {
		this.props.toggleMenu({ signInMenuVisible: false });
	};
	renderPulloutMenu = () => {
		let bg = document.getElementById('pulloutBg');
		let menu = document.getElementById('pullout');
		if (this.props.app.pulloutMenuVisible === false) {
			bg.style.display = 'block';
			bg.classList.remove('removeOverlay');
			menu.classList.remove('pullinAction');
			bg.classList.add('overlayAction');
			menu.classList.add('pulloutAction');

			this.props.toggleMenu({
				pulloutMenuVisible: true,
				accMenuVisible: false,
				notifMenuVisible: false,
				sessionMenuVisible: false
			});
		} else {
			bg.classList.remove('overlayAction');
			menu.classList.remove('pulloutAction');
			this.props.toggleMenu({ pulloutMenuVisible: false });
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
					<img id="surklsTitle" src="/assets/surkls-title2.png" />
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
		let visibility = this.props.app.notifMenuVisible ? 'flex' : 'none';
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
		let visibility = this.props.app.messagesMenuVisible ? 'flex' : 'none';
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
		let visibility = this.props.app.sessionMenuVisible ? 'flex' : 'none';
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
					<option value="wearechange">We Are Change</option>
					<option value="hodgetwins">Hodgetwins</option>
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

		this.props.signIn(JSON.stringify(user), () => {
			this.setState({ signInMenuVisible: false });
			this.props.history.push('/rooms');
		});
	};
	signInMenu = () => {
		let visibility = this.props.app.signInMenuVisible ? 'flex' : 'none';
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
		let visibility = this.props.app.threeDotMenuVisible ? 'flex' : 'none';
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
		let visibility = this.props.app.accMenuVisible ? 'flex' : 'none';
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
							backgroundImage: this.props.auth.user.avatarUrl ? `url(${this.props.auth.user.avatarUrl})` : `url('/assets/whitehat.jpg')`
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
				<Link to="/dashboard" className="menuItem">
					<div className="rightAccIcon" id="profileIcon" />Dashboard
				</Link>
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
								backgroundImage: this.props.auth.user.avatarUrl ? `url(${this.props.auth.user.avatarUrl})` : `url('/assets/whitehat.jpg')`
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
	signIn: PropTypes.func,
	devices: PropTypes.object,
	getDevices: PropTypes.func,
	app: PropTypes.object,
	toggleMenu: PropTypes.func,
	closeMenus: PropTypes.func
};
function stateToProps(state) {
	return {
		auth: state.auth,
		devices: state.devices,
		app: state.app
	};
}
export default connect(stateToProps, { startSession, joinSession, signIn, getDevices, toggleMenu, closeMenus })(withRouter(Header));
