import { OPEN_DMS, SETUP_DMS, UPDATE_DMS, UPDATE_MSGS, ADD_DM, ADD_SESS_DMS } from "actions/types";
//import {isEmpty} from '../../tools/isEmpty';
const initialState = {
	sendToId: '',
	messangers: {},
	messanger: null,
	session_msngrs: {},
	msgs: [],
	currThread: undefined
};

export default function(state = initialState, action) {
	switch (action.type) {
		case UPDATE_MSGS:
			let msgsClone = state.msgs.slice(0);
			msgsClone.push(action.payload)
			return {
			...state,
			msgs: msgsClone,
			currThread: action.payload._id ? action.payload._id : undefined
		};
		case UPDATE_DMS:
			return {
			...state,
			...action.payload
		};
		case ADD_DM:	
			let dmsClone = JSON.parse(JSON.stringify(state.messangers));
			dmsClone[action.payload._id] = action.payload
			return {
			...state,
			messangers: dmsClone,
			messanger: state.messanger._id ===action.payload._id ? action.payload : state.messanger
		};
		case ADD_SESS_DMS:		
			return {
			...state,
			session_msngrs: action.payload,
		};
		case SETUP_DMS:
			return {
			...state,
			messangers: action.payload
		};
		case OPEN_DMS:
			return {
				...state,
				messanger: action.payload,
				currThread: action.payload!==null? action.payload.thread_id : undefined
			};
		default:
			return state;
	}
}
