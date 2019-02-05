import React, { Component } from 'react';
import { getSessions, joinSession } from 'actions/actions';
import PropTypes from 'prop-types';
import 'styles/rooms.scss';
import { connect } from 'react-redux';

class Rooms extends Component {
	componentDidMount() {
		this.props.getSessions();
	}
	joinSession = (sessionKey, room, clientId) => {
		let session = {
			sessionKey: sessionKey,
			room: room,
			clientId: clientId
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
			return (
				<div onClick={() => this.joinSession(room.sessionKey, room.room)} key={ind} className="room">
					{room.room}
				</div>
			);
		});
	};
	render() {
		return <div id="rooms">{this.renderRooms()}</div>;
	}
}
Rooms.propTypes = {
	sessions: PropTypes.object,
	getSessions: PropTypes.func,
	joinSession: PropTypes.func,
	history: PropTypes.object
};
function stateToProps(state) {
	return {
		sessions: state.sessions
	};
}
export default connect(stateToProps, { getSessions, joinSession })(Rooms);
