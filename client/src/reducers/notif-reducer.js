import { UPDATE_NOTIFS, LOAD_NOTIFS, ADD_NOTIF, REMOVE_NOTIF } from "actions/types";
//import {isEmpty} from '../../tools/isEmpty';
const initialState = {
  notifs: [],
  notifCount: 0
};

export default function(state = initialState, action) {
	switch (action.type) {
		case ADD_NOTIF:
			let notifClone = state.notifs.slice(0);	
			notifClone.unshift(action.payload);
			return {
				...state,
				notifs:notifClone,
				notifCount: state.notifCount+=1
		};
		case REMOVE_NOTIF:
			console.log(action.payload)
			let notifClone2 = state.notifs.slice(0);	
			let filt = notifClone2.filter(notif=>notif._id!==action.payload)
			console.log(filt)
			return {
				...state,
				notifs:filt,
		};
    case LOAD_NOTIFS:
			return {
			...state,
			...action.payload
		};
			case UPDATE_NOTIFS:
			return {
				...state,
				...action.payload
		};	
		default:
			return state;
	}
}
