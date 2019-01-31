import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import DropMenu from 'components/smalls/drop-menu';
/* import Pullout from 'components/Header/Pullout-menu'; */
import { startSession, joinSession, signUpOrLogin } from 'actions/actions';
import 'styles/header.scss';
class Header extends Component {
	constructor(props) {
		super(props);
		this.state = {
			disableVid: 'off',
			accMenuVisible: false,
			notifMenuVisible: false,
			sessionMenuVisible: false,
			signInMenuVisible: false,
			pulloutMenuVisible: false,
			roomName: '',
			email: '',
			password: ''
		};
	}
	onInputChange = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};
	onCheckbox = (e) => {
		this.setState({ [e.target.name]: this.state.disableVid == 'off' ? 'on' : 'off' });
	};
	renderAccMenu = () => {
		this.setState({
			accMenuVisible: this.state.accMenuVisible ? false : true,
			notifMenuVisible: false,
			sessionMenuVisible: false,
			pulloutMenuVisible: false,
			signInMenuVisible: false
		});
	};
	renderNotifMenu = () => {
		this.setState({
			notifMenuVisible: this.state.notifMenuVisible ? false : true,
			accMenuVisible: false,
			sessionMenuVisible: false,
			pulloutMenuVisible: false,
			signInMenuVisible: false
		});
	};
	renderCreateSessionMenu = () => {
		console.log(document.getElementById('checkboxInput').value)
		this.setState({
			sessionMenuVisible: this.state.sessionMenuVisible ? false : true,
			accMenuVisible: false,
			notifMenuVisible: false,
			pulloutMenuVisible: false,
			signInMenuVisible: false
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
	hideSignInMenu = () =>{
		this.setState({signInMenuVisible: false})
	}
	/* 	renderPulloutMenu = () =>{
		let bg = document.getElementById('pulloutBg')
		let menu = document.getElementById('pullout');
		if(this.state.pulloutMenuVisible ===false){	
			bg.style.display = 'block';
			bg.classList.remove('removeOverlay')	
			menu.classList.remove('pullinAction');
			bg.classList.add('overlayAction')	
			menu.classList.add('pulloutAction');
		
			this.setState({pulloutMenuVisible:true,
										 accMenuVisible: false,
										 notifMenuVisible: false,
										 sessionMenuVisible: false})
		} else {
		  bg.classList.remove('overlayAction');	
			menu.classList.remove('pulloutAction');			
			this.setState({pulloutMenuVisible:false});
			setTimeout(()=>{
				bg.style.display = 'none';
			},300)
		}
	} */

	/* pulloutMenu = () =>{
		return (
			<Pullout pullIn={this.renderPulloutMenu}>
					<div id="customPulloutHeader">
						<div onClick={this.renderPulloutMenu} id="menuBarsIcon2"></div>
						<img id="surklsTitle" src="/assets/surkls_title.png"/>
					</div>			
					<div className="menuItem">Home</div>
					<div className="menuItem">About</div>
					<div className="menuItem">Sign Up</div>
					<div className="menuItem">Sign in</div>					
			</Pullout>
		)
	} */
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

	createSessionMenu = () => {
		let visibility = this.state.sessionMenuVisible ? 'flex' : 'none';
		return (
			<DropMenu
				menuTitle="Create Session"
				visibility={visibility}
				menuTypeArrow="sessionArrow"
			>
				<input
					onChange={this.onInputChange}
					placeholder="Name your session"
					className="menuInput"
					name="roomName"
					value={this.state.room}
				/>
				<div className="menuConfig">
					Max Members
					<input className="sessionConfig" type="number" name="members" min="1" max="6"></input>
				</div>
				<div className="menuConfig">
					Max Viewers
				<input className="sessionConfig" type="number" name="members" min="1" max="10"></input>
				</div>
				<div className="menuConfig">
					Disable Video
					<div id="checkbox">
						<input value={this.state.disableVid} onChange={this.onCheckbox} id="checkboxInput" style={{marginRight:'10px'}} type="checkbox" name="disableVid"></input>
						<label htmlFor="checkboxInput"></label>
					</div>
				</div>
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
			this.setState({signInMenuVisible:false})
			this.props.history.push('/dashboard');
		});
	};
	signInMenu = () => {
		let visibility = this.state.signInMenuVisible ? 'flex' : 'none';
		return (
			<DropMenu
				menuTitle="Log in with"
				menuTypeArrow="signInArrow"
				visibility={visibility}
			>
				<a onClick={this.hideSignInMenu} href="/auth/google" className="menuItem signInGoogleWrap">
					<div className="signInMenuIcon" id="signInGoogleIcon" /> Google
				</a>
				<a onClick={this.hideSignInMenu}  href="/auth/twitter" className="menuItem signInTwitterWrap">
					<div className="signInMenuIcon" id="signInTwitterIcon" /> Twitter
				</a>
				<a onClick={this.hideSignInMenu}  href="/auth/twitch" className="menuItem signInTwitchWrap">
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
			<DropMenu hideMenu={this.hideAllMenus} menuTypeArrow="accountArrow" visibility={visibility}>
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
		let sessionKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		console.log(sessionKey)
		let name = this.state.roomName;
		let sessionObj = {
			room: name,
			sessionKey: sessionKey
		}
		if (this.state.roomName.length >= 3) {
			this.setState({
				sessionMenuVisible: false,
				roomName: ''
			}, ()=>{
				this.props.startSession(sessionObj, () => {		
					this.props.history.push('/session');
				});
			});		
		} else {
			//@TODO show error
		}
	};
	render() {
		if (!this.props.auth.isAuthenticated) {
			return (
				<div className="header">
					{/* //////////////section///////////*/}
					<div id="leftOfHeader">
						{/* <div onClick={this.renderPulloutMenu} id="menuBarsIcon"></div> */}
						<Link to="/dashboard">
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
					{/* //////////////section///////////*/}
					<div id="leftOfHeader">
						{/* <div onClick={this.renderPulloutMenu} id="menuBarsIcon"></div> */}
						<Link to="/dashboard">
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
						<div onClick={this.renderCreateSessionMenu} id="startSessionIcon" />
						<Link to="/rooms" id="toRoomsIcon"></Link>
						<div id="messageIcon" />
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
	signUpOrLogin: PropTypes.func
};
function stateToProps(state) {
	return {
		auth: state.auth
	};
}
export default connect(stateToProps, { startSession, joinSession, signUpOrLogin })(withRouter(Header));
