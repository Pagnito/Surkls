import React, { Component } from 'react';
import {getSessions, joinSession} from 'actions/actions';
import PropTypes from 'prop-types';
import "styles/rooms.scss";
import { connect } from 'react-redux';

class Rooms extends Component {
  componentDidMount(){
    this.props.getSessions();
  }
  joinSession = (room) => {
    console.log(room)
		if (room.length >= 3) {
			this.props.joinSession(room, () => {
				this.props.history.push('/session');
			});
		} else {
			//@TODO show error
		}
	};
  renderRooms = () => {
    let rooms = [];
    for(let room in this.props.sessions.sessions){
      rooms.push(
        <div onClick={()=>this.joinSession(room)} key={room} className="room">
          {room}
        </div>
      )
    }
    return rooms
  }
  render() {
    return (
      <div id="rooms">
       {this.renderRooms()}
      </div>
    )
  }
}
Rooms.propTypes = {
  sessions: PropTypes.object,
  getSessions: PropTypes.func,
  joinSession: PropTypes.func,
  history: PropTypes.object
}
function stateToProps(state){
  return {
    sessions: state.sessions
  }
}
export default connect(stateToProps,{getSessions, joinSession})(Rooms);