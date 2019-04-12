import React, { Component } from 'react';
import { getSessions, joinSession, closeMenus } from 'actions/actions';
import PropTypes from 'prop-types';
import room_images from './room-images';
import ProfileModal from '../smalls/profile-modal-simple';
import './rooms.scss';
import { connect } from 'react-redux';

class Rooms extends Component {
	componentDidMount() {
		this.props.getSessions();
	}
	closeMenus = () => {
		if (this.props.app.menuState === 'open') {
			this.props.closeMenus({ menu: 'close-menus' });
		}
	};

	joinTrio = (sessionKey, room) => {
		let session = {
			sessionKey: sessionKey,
			room: room,
			isAdmin: false,
			notShareLink: true,
			sessionType: 'trio'
		};
		if (sessionKey.length >= 3) {
			this.props.joinSession(session, () => {
				this.props.history.push('/session/room=' + sessionKey.toString());
			});
		} else {
			//@TODO show error
		}
	};
	joinStreamWithoutCam = (sessionKey, room, clients) => {
		let session = {
			sessionKey: sessionKey,
			room: room,
			isAdmin: clients.length === 0 ? true : false,
			notShareLink: true,
			noCam: true,
			sessionType: 'stream'
		};
		if (sessionKey.length >= 3) {
			this.props.joinSession(session, () => {
				this.props.history.push('/session/noCamroom=' + sessionKey.toString());
			});
		} else {
			//@TODO show error
		}
	};
	joinStreamWithCam = (sessionKey, room, clients) => {
		let session = {
			sessionKey: sessionKey,
			room: room,
			isAdmin: clients.length === 0 ? true : false,
			notShareLink: true,
			noCam: false,
			sessionType: 'stream'
		};
		if (sessionKey.length >= 3) {
			this.props.joinSession(session, () => {
				this.props.history.push('/session/room=' + sessionKey.toString());
			});
		} else {
			//@TODO show error
		}
	};
	renderRooms = () => {
		return this.props.sessions.sessions.map((room, ind) => {
			let typeOfJoins;
			let joinAsHeader;
			if (room.sessionType === 'trio') {
				if (room.maxedOut) {
					typeOfJoins = (
						<div className="join-btns">
							<button type="button" className="join-btn">
								Maxed out
							</button>
						</div>
					);
				} else {
					typeOfJoins = (
						<div className="join-btns">
							<button
								onClick={() => this.joinTrio(room.sessionKey, room.room, room.clients)}
								type="button"
								className="join-btn"
							>
								Join Trio
							</button>
						</div>
					);
				}
			} else if (room.sessionType === 'stream') {
				if (room.clients.length === 0) {
					joinAsHeader = <div style={{ marginBottom: '5px', marginLeft: '5px' }}>Join as</div>;
					typeOfJoins = (
						<div className="join-btns">
							<button
								onClick={() => this.joinStreamWithCam(room.sessionKey, room.room, room.clients)}
								type="button"
								className="join-btn"
							>
								Streamer
							</button>
							<button
								onClick={() => this.joinStreamWithoutCam(room.sessionKey, room.room, room.clients)}
								type="button"
								className="join-btn"
							>
								Viewer
							</button>
						</div>
					);
				} else {			
						typeOfJoins = (
							<div className="join-btns">
								<button
									onClick={() => this.joinStreamWithoutCam(room.sessionKey, room.room, room.clients)}
									type="button"
									className="join-btn"
								>
									Join Stream
								</button>
							</div>
						);
					}
				}
			
			let roomType =
				room.sessionType === 'trio' ? (
					<div className="trio-icon room-type-icon" />
				) : (
					<div className="room-type-icon stream-icon" />
				);

			return (
				<div
					style={{
						backgroundImage: `url(${room_images[room.category.replace('+', '_')]})`,
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
						backgroundSize: 'cover'
					}}
					key={ind}
					className="room"
				>
					<div className="hover-overlay" />
					<div className="room-header">
						<div className="room-name">
							{roomType}
							{room.room}
						</div>
						<div className="room-category">{room.category.replace('+', ' ')}</div>
					</div>
					<div className="joins">
						<div className="joins-left">
							{joinAsHeader}
							{typeOfJoins}
						</div>
						<div className="joins-right">
							<div className="room-clients">
								{room.clients.map((client, ind) => {
									{
										return (
											<div
												key={ind}
												className="room-client"
												style={{
													backgroundImage: `url(${client.avatarUrl})`,
													backgroundPosition: 'center',
													backgroundRepeat: 'no-repeat',
													backgroundSize: 'cover'
												}}
											>
												<ProfileModal
													id={'c-modal' + ind}
													position={{ right: '-15px', top: '45px' }}
													user={client}
												/>
											</div>
										);
									}
								})}
							</div>
							<div className="room-viewers">
								{room.viewers.map((viewer, ind) => {
									{
										return (
											<div
												key={ind}
												className="room-viewer"
												style={{
													backgroundImage: `url(${viewer.avatarUrl})`,
													backgroundPosition: 'center',
													backgroundRepeat: 'no-repeat',
													backgroundSize: 'cover',
													marginTop: '7px'
												}}
											>
												<ProfileModal
													id={'v-modal' + ind}
													position={{ right: '-20px', top: '40px' }}
													user={viewer}
												/>
											</div>
										);
									}
								})}
							</div>
						</div>
					</div>
				</div>
			);
		});
	};
	render() {
		return (
			<div onClick={() => this.closeMenus('close-menus')} id="rooms">
				{this.renderRooms()}
			</div>
		);
	}
}
Rooms.propTypes = {
	sessions: PropTypes.object,
	getSessions: PropTypes.func,
	joinSession: PropTypes.func,
	history: PropTypes.object,
	closeMenus: PropTypes.func,
	app: PropTypes.object
};
function stateToProps(state) {
	return {
		sessions: state.sessions,
		app: state.app
	};
}
export default connect(stateToProps, { getSessions, joinSession, closeMenus })(Rooms);
