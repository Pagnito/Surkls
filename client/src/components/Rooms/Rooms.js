import React, { Component } from 'react';
import { getSessions, joinSession, closeMenus } from 'actions/actions';
import PropTypes from 'prop-types';
import room_images from './room-images';
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
					<div style={{backgroundImage: `url(${room_images[room.category]})`,
						backgroundPosition:'center',
						backgroundRepeat:'no-repeat',
						backgroundSize:'cover'}} key={ind} className="room">
						
						<div className="room-header">
							<div className="room-name"><div className="on-dot"></div>{room.room}</div>
							<div className="room-category">{room.category}</div>
						</div>
						
						<div className="joins">
							<div className="joins-left">
								<div className="joins-title">Join as</div>
								<div className="join-btns">
									<button type="button" className="join-btn"> Viewer</button>
									<button onClick={() => this.joinSession(room.sessionKey, room.room)} type="button" className="join-btn">Participator</button>
								</div>	
							</div>
							<div className="joins-right">
								<div className="room-clients">
										{room.clients.map((client,ind)=>{{
											return <div key={ind} className="room-client" style={{
												backgroundImage: `url(${client.avatarUrl})`,
												backgroundPosition:'center',
												backgroundRepeat:'no-repeat',
												backgroundSize:'cover'
										}}></div>}})}
								</div>
							</div>						
						</div>
						<div className="hover-overlay"></div>
					</div>
				);
			}	else {
				return (
					<div style={{backgroundImage: `url(${room_images[room.category]})`,
						backgroundPosition:'center',
						backgroundRepeat:'no-repeat',
						backgroundSize:'cover'}} key={ind} className="room">
						<div className="room-header">
						<div className="maxed-out-overlay"></div>
							{room.room}
							<div className="room-category">{room.category}</div>
						</div>
						<div className="joins">
							<div className="joins-title">Join as</div>
							<div className="join-btns">
								<button type="button" className="join-btn"> Viewer</button>
								<button  type="button" className="join-btn">Participator</button>
							</div>			
						</div>
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
