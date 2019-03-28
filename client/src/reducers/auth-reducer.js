import { DESTROYED_SURKL, SET_USER, GET_USER, UPDATE_USER_MEMBERSHIP, SET_GUEST, NEW_SURKL_ADMIN, LEFT_SURKL  } from "actions/types";
import {isEmpty} from '../../tools/isEmpty';
const initialState = {
	isAuthenticated: false,
	user: null
};
let dms = {};
export default function(state = initialState, action) {
	switch (action.type) {	
		case UPDATE_USER_MEMBERSHIP:
			let clone = JSON.parse(JSON.stringify(state))
			clone.user.memberOf = action.payload
			return {
				...state,
				...clone
			}	
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
			
		case SET_GUEST:
			return {
				...state,
				isAuthenticated: false,
				user: {},
				...action.payload
			}
		case DESTROYED_SURKL:
			let clone2 = JSON.parse(JSON.stringify(state))
			delete clone2.user.mySurkl
			return {
				...clone2,	
			};
		case LEFT_SURKL:
			let clone3 = JSON.parse(JSON.stringify(state))
			delete clone3.user.memberOf
			return {
				...clone3,	
			};
		case NEW_SURKL_ADMIN:
			let clone4 = JSON.parse(JSON.stringify(state));
			clone4.user.memberOf = {
				bannerUrl: action.payload.bannerUrl,
				name: action.payload.name,
				surkl_id: action.payload._id
			}
			delete clone4.user.mySurkl
			return {
				...clone4
			};
		default:
			return state;
	}
}
