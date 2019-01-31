import React, { Component } from 'react';
import { getSessions, joinSession } from 'actions/actions';
import PropTypes from 'prop-types';
import 'styles/rooms.scss';
import { connect } from 'react-redux';

class Rooms extends Component {
	componentDidMount() {
		this.props.getSessions();
	}
	joinSession = (sessionKey) => {
		if (sessionKey.length >= 3) {
			this.props.joinSession(sessionKey, () => {
				this.props.history.push('/session');
			});
		} else {
			//@TODO show error
		}
	};
	renderRooms = () => {
		return this.props.sessions.sessions.map((room) => {
			return (
				<div onClick={() => this.joinSession(room.sessionKey)} key={room.sessionKey} className="room">
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
