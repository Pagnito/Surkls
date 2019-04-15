import {
	SET_USER,
	GET_USER,
	START_SESSION,
	JOIN_SESSION,
	GET_SESSIONS,
	GET_DEVICES,
	UPDATE_SESSION,
	SEND_VIDEO,
	NEW_ADMIN,
	UNPICK_VIDEO,
	SEND_TWEET,
	UPDATE_USER_MEMBERSHIP,
	CLOSE_ALLMENUS,
	TOGGLE_MENU,
	UPDATE_APP,
	REMOVE_KEYS
} from 'actions/types';
import axios from 'axios';
export const getUser = () => (dispatch) => {
	axios
		.get('/account')
		.then((data) => {
			dispatch({
				type: GET_USER,
				payload: data.data
			});
		})
		.catch((err) => {
			console.log(err)
			dispatch({
				type: GET_USER,
				payload: {}
			});
		});
};

export const getSessions = () => (dispatch) => {
	fetch('/api/sessions').then((data) => data.json()).then((sessions) => {
		let rooms = [];
		for (let room in sessions) {
			rooms.push(JSON.parse(sessions[room]));
		}
		dispatch({
			type: GET_SESSIONS,
			payload: rooms
		});
	});
};

export const getDevices = () => (dispatch) => {
	let cams = [];
	let mics = [];
	navigator.mediaDevices.enumerateDevices().then((devices) => {
		devices.forEach((device) => {
			if (device.kind === 'videoinput') {
				cams.push(device);
			} else if (device.kind === 'audioinput') {
				mics.push(device);
			}
		});
		let deviceObj = {
			mics: mics,
			cams: cams
		};
		dispatch({
			type: GET_DEVICES,
			payload: deviceObj
		});
	});
};
export const signUp = (user, cb) => (dispatch) => {
	let options = {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json;charset=UTF-8'
		},
		body: user
	};
	fetch('/auth/register', options)
		.then((res) => res.json())
		.then((user) => {
			dispatch({
				type: SET_USER,
				payload: user.userName ? user : {}
			});
			if(user.userName){
				cb(user);
			}
		
		})
		.catch(() => {
			dispatch({
				type: SET_USER,
				payload: {}
			});
		});
};
export const updateUserMem = (surkl) => {
	return {
		type: UPDATE_USER_MEMBERSHIP,
		payload:surkl
	}
}
export const signIn = (user, cb) => (dispatch) => {
	let options = {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json;charset=UTF-8'
		},
		body: user
	};
	fetch('/auth/login', options)
		.then((res) => res.json())
		.then((user) => {
			dispatch({
				type: SET_USER,
				payload: user
			});
			cb(user);
		})
		.catch(() => {
			dispatch({
				type: SET_USER,
				payload: {}
			});
		});
};
export const updateApp = (appObj) =>{
	return {
		type: UPDATE_APP,
		payload: appObj
	}
}
export const startSession = (sessionInfo, cb) => (dispatch) => {
	dispatch({
		type: START_SESSION,
		payload: sessionInfo
	});
	cb();
};
export const joinSession = (sessionInfo, cb) => (dispatch) => {
	dispatch({
		type: JOIN_SESSION,
		payload: sessionInfo
	});
	cb();
};
export const updateSession = (payload) =>  {
	return {
		type: UPDATE_SESSION,
		payload: payload
	};
};
export const removeKeys = (payload, cb) => (dispatch)=> {
	dispatch({
		type: REMOVE_KEYS,
		payload: payload
	})
	cb()
}
export const newAdmin = () => {
	return {
		type: NEW_ADMIN,
		payload: {
			isAdmin: true
		}
	}
}
export const sendTweetAction = (tweetObj) => {
	return {
		type:SEND_TWEET,
		payload:tweetObj
	}
}
export const sendThisVideoAction = (playState) => {
	return {
		type:SEND_VIDEO,
		payload:playState
	}
}
export const unpickThisVideoAction = (playState) => {
	return {
		type:UNPICK_VIDEO,
		payload:playState
	}
}

export const closeMenus =(action)=>{
	return {
		type: CLOSE_ALLMENUS,
		payload:action
	}
}
export const toggleMenu = (menu) =>{
	return {
		type: TOGGLE_MENU,
		payload: menu
	}
}

