import { MY_SURKL, UPDATE_SURKL_MSGS, UPDATE_MY_SURKL, UPDATE_ON_MEMBERS } from "actions/types";

const initialState = {
	mySurkl: {},
	msgs: [],
	online: []
};

export default function(state = initialState, action) {
	switch (action.type) {
		case UPDATE_MY_SURKL:
		return {
			...state,
			mySurkl: action.payload
		};
		case UPDATE_SURKL_MSGS:
			return {
				...state,
				msgs: action.payload
			};
		case UPDATE_ON_MEMBERS:
			return {
				...state,
				online: action.payload
			};
		case MY_SURKL:
			return {
				...state,
				mySurkl: action.payload
			};
		
		default:
			return state;
	}
}
