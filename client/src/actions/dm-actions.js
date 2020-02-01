import {
OPEN_DMS,
UPDATE_DMS,
UPDATE_MSGS,
ADD_DM,
ADD_DMS,
LOAD_MSGS,
ADD_NEW_USER_TO_DM_LIST
} from 'actions/types';

export const fetchMsgThreads = (id) => (dispatch) =>{
	fetch('/api/dms/'+id)
	.then(res=>res.json())
	.then(data=>{
		let threads = {};
		data.forEach(thread=>{threads[thread.user_id]=thread})
		dispatch({
			type: UPDATE_DMS,
			payload: {messangers:threads}
		})
	})
}

export const updateDMs = (dms) => {
	return {
		type: UPDATE_DMS,
		payload: dms
	}
}
export const updateMsgs = (msg, newUser) => (dispatch)=>{
	dispatch({
		type: UPDATE_MSGS,
		payload: msg
	})
	if(newUser){
		dispatch({
			type: ADD_NEW_USER_TO_DM_LIST,
			payload: newUser
		})
	}
}
export const addToDMs = (user) => {
	return {
		type: ADD_DM,
		payload: user
	}
}
export const addSessDMs = (users) => {
	return {
		type: ADD_SESS_DM,
		payload: users
	}
}
export const addMultiToDMs = (users) => {
	return {
		type: ADD_DMS,
		payload: users
	}
}
export const openDMs = (dm_user, cb) =>(dispatch)=> {
	dispatch({
		type: OPEN_DMS,
		payload: dm_user
	});
	if(dm_user.thread_id){
		fetch('/api/dm_thread/'+dm_user.thread_id)
		.then(res=>res.json())
		.then(data=>{
			dispatch({
				type:LOAD_MSGS,
				payload: data
			})
		})
	} else {
		dispatch({
			type:LOAD_MSGS,
			payload: []
		})
	}
	
	cb(dm_user)
}
export const closeDMs = () =>{
	return ({
		type: OPEN_DMS,
		payload: null
	})
}
/* export const sendDM = (msgsObj) => (dispatch) => {

	
} */