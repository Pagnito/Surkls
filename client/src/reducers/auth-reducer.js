import { SET_USER, GET_USER, USER_SURKL } from "actions/types";
import {isEmpty} from '../../tools/isEmpty';
const initialState = {
	isAuthenticated: false,
	user: null
};
let dms = {};
export default function(state = initialState, action) {
	switch (action.type) {	
		case USER_SURKL:
		console.log(action.payload)
		let clone = JSON.parse(JSON.stringify(state.user))
		clone.mySurkl = action.payload
		clone.mySurkl.surkl_id = action.payload._id
			return {
				...state,
				user: clone
			};
		case GET_USER:
			if(action.payload.dms){
				action.payload.dms.forEach(dm=>dms[dm.user_id] = dm)
				action.payload.dms = dms
			}
			return {
				...state,
				isAuthenticated: !isEmpty(action.payload),
				user: action.payload
			};
		case SET_USER:
			if(action.payload.dms){
				action.payload.dms.forEach(dm=>dms[dm.user_id] = dm)
				action.payload.dms = dms
			}
			return {
				...state,
				isAuthenticated: !isEmpty(action.payload),
				user: action.payload
			}
		default:
			return state;
	}
}
