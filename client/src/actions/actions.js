import { SET_USER, GET_USER, START_SESSION, JOIN_SESSION, GET_SESSIONS } from 'actions/types';
import axios from 'axios';
export const getUser = () => (dispatch) => {
	axios.get('/account').then((data) => {
		dispatch({
			type: GET_USER,
			payload: data.data
		});
	});
};
export const getSessions = () => (dispatch)=> {
	fetch('/api/sessions')
		.then(data=>data.json())
		.then(sessions=>{
			let rooms = [];
			for(let room in sessions){
				rooms.push(JSON.parse(sessions[room]));
			}
			dispatch({
				type: GET_SESSIONS,
				payload: rooms
			})
		})
}
export const signUpOrLogin = (user,cb) => (dispatch) => {
	let options = {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json;charset=UTF-8'
		},
		body: user
	};
	fetch('/auth/login', options).then((res) => res.json()).then((user) => {
		dispatch({
			type: SET_USER,
			payload: user
    });
    cb()
	});
};
export const startSession = (sessionInfo, cb) => (dispatch) =>{
	dispatch({
		type: START_SESSION,
		payload: sessionInfo
	})
	cb()
}
export const joinSession = (sessionInfo, cb) => (dispatch) =>{
	dispatch({
		type: JOIN_SESSION,
		payload: sessionInfo
	})
	cb()
}