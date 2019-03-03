import {
OPEN_DMS,
UPDATE_DMS,
UPDATE_MSGS,
ADD_DM
} from 'actions/types';

export const updateDMs = (dms) => {
	return {
		type: UPDATE_DMS,
		payload: dms
	}
}
export const updateMsgs = (msg) => {
	return {
		type: UPDATE_MSGS,
		payload: msg
	}
}
export const addToDMs = (user) => {
	return {
		type: ADD_DM,
		payload: user
	}
}
export const openDMs = (dm_user) => {
	return {
		type: OPEN_DMS,
		payload: dm_user
	}
}
/* export const sendDM = (msgsObj) => (dispatch) => {

	
} */