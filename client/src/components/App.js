import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { GET_USER,UPDATE_DMS,LOAD_NOTIFS, SET_GUEST, SETUP_COMPLETE } from 'actions/types';
import { Route, withRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { setUserMedia } from '../../tools/setUserMedia';
import io from 'socket.io-client';
import {names} from '../../tools/names';
import Store from '../store';
import SignUp from 'components/Sign-up/Sign-up';
import Surkl from 'components/Surkl/Surkl';
import Session from 'components/Session/Session';
import Rooms from 'components/Rooms/Rooms';
import Header from 'components/Header/Header';
import CreateSurkl from 'components/Create-surkl/Create-surkl';
import Settings from 'components/Settings/Settings';
import Surkls from 'components/Surkls/Surkls';
import About from 'components/About/About';
/*const Loading = () => Loader;

const Entries = Loadable({
  loader: () => import('./entries'),
  loading: Loading(),
});*/

class App extends Component {
	constructor(props){
		console.log(process.env)
		super(props);
		this.socket = io(process.env.ENV === 'dev' ? 'http://localhost:4000' : 'https://surkls.herokuapp.com');
		this.socket.on('setup-complete', (ppl)=>{
			Store.dispatch({
				type:SETUP_COMPLETE,
				payload:ppl
			})
		})
	}
	componentDidMount() {
	
		setUserMedia();
		fetch('/account').then((res) => res.json()).then((user) =>{
			if(user.userName){
				Store.dispatch({
					type: GET_USER,
					payload: user
				})
				this.socket.emit('setup', user)	
				Store.dispatch({
					type: UPDATE_DMS,
					payload: {notifCount: user.new_msg_count}
				})	
				Store.dispatch({
					type: LOAD_NOTIFS,
					payload: {notifCount: user.notif_count, notifs: user.notifs}
				})
			}	else {
				let randomFirstName = Math.floor(Math.random() * names.first.length);
				let randomLastName = Math.floor(Math.random() * names.last.length);

				let temp = {
					_id: Math.random().toString(36).substring(2, 15),
					avatarUrl: '/assets/whitehat.jpg',
					userName: names.first[randomFirstName] + '_' + names.last[randomLastName],
					isAdmin:false,
					guest: true
				}
				Store.dispatch({
					type: SET_GUEST,
					payload: {guest:temp}
				});
				this.socket.emit('setup', temp)	
			}		
			if(this.props.location.pathname == '/signup' ){		
				this.props.history.push('/')
			}		
		}).catch(()=>{
			let temp = {
				_id: Math.random().toString(36).substring(2, 15),
				avatarUrl: '/assets/whitehat.jpg',
				userName: 'Guest'+Math.random().toString(36).substring(2, 15),
				isAdmin:false,
				guest: true
			}
			Store.dispatch({
				type: SET_GUEST,
				payload: {guest:temp}
			});
			this.socket.emit('setup', temp)	
		})
	}

	render() {
			return (
				<Provider store={Store}>	
					<Route exact path="/surkls" render={(props)=><Surkls {...props} socket={this.socket}/>} />
					<Route exact path="/settings" component={Settings} />
					<Route exact path="/about" component={About} />
					<Route 
						exact path="/signup" render={(props)=><SignUp {...props} socket={this.socket}/>}   />
					<Route 
						exact path="/surkl/:id" render={(props)=><Surkl {...props} socket={this.socket}/>}   />
					<Route 
						exact path="/create_surkl" render={(props)=><CreateSurkl {...props} socket={this.socket}/>}   />
					<Route 
						exact path="/session/:type/:id" render={(props)=><Session {...props} socket={this.socket}/>}   />
					<Route exact path="/" component={Rooms}  />
					<Header socket={this.socket} />
				</Provider>
			);
	}
}
App.propTypes = {
	getUser: PropTypes.func,
	history: PropTypes.object,
	location: PropTypes.object
};
export default withRouter(App);
