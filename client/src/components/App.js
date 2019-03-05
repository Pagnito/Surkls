import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { GET_USER,UPDATE_DMS } from 'actions/types';
import { Route, withRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { setUserMedia } from '../../tools/setUserMedia';
import io from 'socket.io-client';
import {socketUrl} from '../../tools/socketUrl';
import Store from '../store';
import Home from 'components/Home/Home';
import Dashboard from 'components/Dashboard/Dashboard';
import Session from 'components/Session/Session';
import Rooms from 'components/Rooms/Rooms';
import Header from 'components/Header/Header';
import Profile from 'components/Profile/Profile';


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
			Store.dispatch({
				type: GET_USER,
				payload: user
			})
			this.socket.emit('setup', user)	
			console.log(user)
			Store.dispatch({
				type: UPDATE_DMS,
				payload: {notifCount: user.new_msg_count}
			})		
			if(this.props.location.pathname === '/' ){		
				this.props.history.push('/rooms')
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
					<Header socket={this.socket} />
					<Route exact path="/profile" component={Profile} />
					<Route exact path="/" component={Home}  />
					<Route exact path="/dashboard" component={Dashboard}  />
					<Route 
					exact path="/session/:room" render={(props)=><Session {...props} socket={this.socket}/>}   />
					<Route exact path="/rooms" component={Rooms}  />
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
