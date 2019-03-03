import { OPEN_DMS, SETUP_DMS, UPDATE_DMS, UPDATE_MSGS, ADD_DM, ADD_DMS } from "actions/types";
//import {isEmpty} from '../../tools/isEmpty';
const initialState = {
	sendToId: '',
	messangers: {},
	messanger: null,
	msgs: []
};

export default function(state = initialState, action) {
	switch (action.type) {
		case UPDATE_MSGS:
			let msgsClone = state.msgs.slice(0);
			msgsClone.push(action.payload)
			return {
			...state,
			msgs: msgsClone
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
		case ADD_DMS:		
			let dmsClone2 = JSON.parse(JSON.stringify(state.messangers));
			let assigned = Object.assign(action.payload, dmsClone2)
			return {
			...state,
			messangers: assigned,
	};
		case SETUP_DMS:
			return {
			...state,
			messangers: action.payload
		};
		case OPEN_DMS:
			return {
				...state,
				messanger: action.payload
			};
		default:
			return state;
	}
}
