import { OPEN_DMS, SETUP_DMS, UPDATE_DMS, UPDATE_MSGS, ADD_DM, ADD_SESS_DMS, LOAD_MSGS } from "actions/types";
//import {isEmpty} from '../../tools/isEmpty';
const initialState = {
	sendToId: '',
	messangers: {},
	messanger: null,
	session_msngrs: {},
	msgs: [],
	currThread: undefined,
	notifCount: 0
};

export default function(state = initialState, action) {
	switch (action.type) {
		case UPDATE_MSGS:
			let msgsClone = state.msgs.slice(0);
			let msngrsClone = JSON.parse(JSON.stringify(state.messangers))
			msgsClone.push(action.payload)
			if(state.messangers.hasOwnProperty(action.payload.user_id)){			
				msngrsClone[action.payload.user_id].latestMsg = action.payload.msg 
			}
			return {
			...state,
			msgs: msgsClone,
			messangers: msngrsClone,
			currThread: action.payload._id ? action.payload._id : undefined,
			notifCount: state.messanger==null ? state.notifCount+=1 : 0
		};
		case LOAD_MSGS:	
			return {
			...state,
			msgs: action.payload
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
				currThread: action.payload!==null? action.payload.thread_id : undefined,
				msgs: action.payload === null ? [] : state.msgs,
				notifCount: 0
			};
		default:
			return state;
	}
}
