import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { GET_USER,UPDATE_DMS,LOAD_NOTIFS } from 'actions/types';
import { Route, withRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { setUserMedia } from '../../tools/setUserMedia';
import io from 'socket.io-client';
import {socketUrl} from '../../tools/socketUrl';
import Store from '../store';
import SignUp from 'components/Sign-up/Sign-up';
import Dashboard from 'components/Dashboard/Dashboard';
import Session from 'components/Session/Session';
import Rooms from 'components/Rooms/Rooms';
import Header from 'components/Header/Header';
import Profile from 'components/Profile/Profile';
import CreateSurkl from 'components/Create-surkl/Create-surkl';
import Settings from 'components/Settings/Settings'
/*const Loading = () => Loader;

const Entries = Loadable({
  loader: () => import('./entries'),
  loading: Loading(),
});*/

class App extends Component {
	constructor(props){
		super(props);
		this.socket = io(socketUrl.url);
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
				Store.dispatch({
					type: GET_USER,
					payload: {}
				})
				this.socket.emit('setup', user)	
				Store.dispatch({
					type: UPDATE_DMS,
					payload: {notifCount: 0}
				})	
				Store.dispatch({
					type: LOAD_NOTIFS,
					payload: {notifCount: 0, notifs: []}
				})
			}		
			if(this.props.location.pathname == '/signup' ){		
				this.props.history.push('/')
			}		
		}).catch(()=>{
			Store.dispatch({
				type: GET_USER,
				payload: {}
			})
		})
	}

	render() {
			return (
				<Provider store={Store}>	
					<Route exact path="/settings" component={Settings} />
					<Route exact path="/profile" component={Profile} />
					<Route 
						exact path="/signup" render={(props)=><SignUp {...props} socket={this.socket}/>}   />
					<Route 
						exact path="/surkl/:id" render={(props)=><Dashboard {...props} socket={this.socket}/>}   />
					<Route 
						exact path="/create_surkl" render={(props)=><CreateSurkl {...props} socket={this.socket}/>}   />
					<Route 
						exact path="/session/:room" render={(props)=><Session {...props} socket={this.socket}/>}   />
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
