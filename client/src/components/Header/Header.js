import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import DropMenu from 'components/smalls/drop-menu';
import Pullout from 'components/Header/Pullout-menu';
import { startSession, joinSession, signIn, getDevices, toggleMenu, closeMenus, updateApp } from 'actions/actions';
import { openDMs, updateDMs, updateMsgs, addToDMs, fetchMsgThreads} from 'actions/dm-actions';
import { subCategories } from 'components/Session/Sub-comps/sub-categories';
import './header.scss';
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
			dm_msg: ''
		};
		this.menusClosed = true;
		this.socketId = ''
		this.socket = this.props.socket;
		
		this.socket.on('msg',(msg)=>{
			this.props.updateMsgs(msg)
		})
		this.socket.on('open-dm',(user)=>{
			this.props.addToDMs(user)
		})
		this.socket.on('update-dms',(user)=>{
			this.props.addToDMs(user)
		})
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
		if(Object.keys(this.props.dms.messangers).length==0 && this.menusClosed==true){
			this.props.fetchMsgThreads(this.props.auth.user._id)
		}
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
	
	/////////////////////////////////^^^^unctions^^^^/////////////////////////////////
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
	sendDM = (e) => {
		if(e.key==='Enter'){
			e.preventDefault()
			let me = this.props.auth.user;
			let rec = this.props.dms.messanger
	
			let msg = {
				receiver: rec,
				sender: this.socket.id,
				msg:this.state.dm_msg,
				userName: me.userName,
				avatarUrl: me.avatarUrl,
				user_id: me._id,
				_id: this.props.dms.currThread ? this.props.dms.currThread : undefined
			}
			this.socket.emit('msg', msg);
			this.setState({dm_msg:''})		
		}	
	}
	openDMs = (dm_user) => {
		this.props.openDMs(dm_user);
		this.socket.emit('open-dm', this.props.auth.user, dm_user.socketId)
	}
	closeDMs = () => {
		this.props.openDMs(null);
	}
	feedDMs = () => {
		let msngrs = this.props.dms.messangers;
		let threads = [];
		if(Object.keys(msngrs.length>0)){
			for(let ms in msngrs){
				threads.push(
					<div onClick={()=>this.openDMs(msngrs[ms])} key={ms} className="msngr">
						<img className="msngr-avatar" src={msngrs[ms].avatarUrl}></img>
						<div className="msngr-name-n-msg">
							<div className="msngr-name">{msngrs[ms].userName}</div>
							
						</div>
					</div>
				)
			}
			return threads;
		}	
	}
	displayMsgs = () =>{
		return this.props.dms.msgs.map((msg,ind)=>{
			if(this.props.auth.user._id!==msg.user_id){
				return (
					<div style={{
						padding:'5px',
						paddingLeft:'10px',
						paddingRight:'10px',
						boxSizing:'border-box',
						background:'white',
						borderRadius:'20px',
						marginTop: '5px',
						maxWidth:'70%',	
						alignSelf:'flex-start',					
						wordBreak: 'break-word',
						display:'flex',
						flexShrink:'0',	
						alignContent:'flex-start'}} key={ind}>
						<img src={msg.avatarUrl} style={{
							width:'20px',
							height:'20px',
							borderRadius:'20px',
							marginRight:'8px',
							flexShrink:'0'					
							 }}/>
						<div style={{flexShrink:'0',maxWidth:'calc(100% - 25px)'}}>{msg.msg}</div>
					</div>
				)
			} else {
				return (
					<div style={{
						padding:'5px',
						maxWidth:'70%',
						alignSelf:'flex-end',
						paddingLeft:'10px',
						paddingRight:'10px',
						marginTop: '5px',
						wordBreak: 'break-word',
						boxSizing:'border-box',
						background:'#FFCD44',
						borderRadius:'20px',
					}} key={ind}>{msg.msg}</div>
				)
			}
			
	})
}
	dmMsngr = () =>{
		let user = this.props.dms.messanger
		if(user){
			let avatar = user.avatarUrl ? user.avatarUrl : '/assets/whitehat.jpg'
			return(
				<div id="dm-msngr">
					<div className="dm-msngr-header">
						<img className="dm-msngr-header-avatar" src={avatar}></img>
						<div className="dm-msngr-header-username">{user.userName}</div>
						<div onClick={this.closeDMs} className="dm-msngr-header-close"></div>
					</div>
					<div className="dm-msngr-feed">
						{this.displayMsgs()}
					</div>
					<div className="dm-msngr-input-wrap">
						<textarea id="msg-texter" onKeyDown={this.sendDM} onChange={this.onInputChange} name="dm_msg" value={this.state.dm_msg} placeholder="Write your messagge" className="dm-msngr-input"/>
					</div>
				</div>
			)
		}	
	}
	messagesMenu = () => {
		let visibility = this.props.app.messagesMenuVisible ? 'flex' : 'none';
		return (
			<DropMenu hideMenu={this.hideAllMenus} menuTitle="Messages" visibility={visibility} menuTypeArrow="messagesArrow">
				<div id="dmMsgsFeed"></div>
					
				{this.feedDMs()}

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
			this.props.toggleMenu({
					sessionMenuVisible: false
				});			
			this.props.startSession(sessionObj, () => {
				this.props.history.push('/session/room=' + sessionKey.toString());
				});
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
						<div onClick={this.renderMessagesMenu} id="messageIcon" >
							<div className="red-alert-dot">1</div>
						</div>
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
					{this.dmMsngr()}
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
	closeMenus: PropTypes.func,
	dms: PropTypes.object,
	updateApp: PropTypes.func,
	openDMs: PropTypes.func,
	updateDMs: PropTypes.func,
	updateMsgs: PropTypes.func,
	socket: PropTypes.object,
	addToDMs: PropTypes.func,
	fetchMsgThreads: PropTypes.func
};
function stateToProps(state) {
	return {
		auth: state.auth,
		devices: state.devices,
		app: state.app,
		dms: state.dms
	};
}
export default connect(stateToProps, 
	{ startSession, joinSession,
		 signIn, getDevices, 
		 toggleMenu, closeMenus,
		 updateApp,
		 updateDMs,
		 updateMsgs,
		 openDMs,
		 addToDMs,
		 fetchMsgThreads
	})(withRouter(Header));
