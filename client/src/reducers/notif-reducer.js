import { UPDATE_NOTIFS, LOAD_NOTIFS } from "actions/types";
//import {isEmpty} from '../../tools/isEmpty';
const initialState = {
  notifs: [],
  notifCount: 0
};

export default function(state = initialState, action) {
	switch (action.type) {
    case LOAD_NOTIFS:
    return {
    ...state,
    ...action.payload
  };
		case UPDATE_NOTIFS:
			//let notifClone = state.msgs.slice(0);	
			return {
			...state,
			...action.payload
		};	
		default:
			return state;
	}
}
