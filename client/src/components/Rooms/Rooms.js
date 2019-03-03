import React, { Component } from 'react';
import { getSessions, joinSession, closeMenus } from 'actions/actions';
import PropTypes from 'prop-types';
import './rooms.scss';
import { connect } from 'react-redux';

class Rooms extends Component {
	componentDidMount() {
		this.props.getSessions();
	}
	closeMenus = () =>{
    if(this.props.app.menuState === 'open'){
      this.props.closeMenus({menu:'close-menus'});
    }	
	}

	joinSession = (sessionKey, room) => {
		let session = {
			sessionKey: sessionKey,
			room: room,
			isAdmin: false,
			notShareLink: true
		}
		if (sessionKey.length >= 3) {
			this.props.joinSession(session, () => {
				this.props.history.push('/session/room='+sessionKey.toString());
			});
		} else {
			//@TODO show error
		}
	};
	renderRooms = () => {
		return this.props.sessions.sessions.map((room,ind) => {
			if(!room.maxedOut){
				return (
					<div onClick={() => this.joinSession(room.sessionKey, room.room)} key={ind} className="room">
						{room.room}
					</div>
				);
			}	else {
				return (
					<div  key={ind} className="room">
						{room.room}
						room is maxed out
					</div>
				);
			}	
		});
	};
	render() {
		return <div onClick={()=>this.closeMenus('close-menus')} id="rooms">{this.renderRooms()}</div>;
	}
}
Rooms.propTypes = {
	sessions: PropTypes.object,
	getSessions: PropTypes.func,
	joinSession: PropTypes.func,
	history: PropTypes.object,
	closeMenus: PropTypes.func,
	app:PropTypes.object
};
function stateToProps(state) {
	return {
		sessions: state.sessions,
		app: state.app
	};
}
export default connect(stateToProps, { getSessions, joinSession, closeMenus })(Rooms);
