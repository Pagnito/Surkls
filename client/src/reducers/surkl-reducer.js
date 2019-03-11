import { MY_SURKL, UPDATE_SURKL_MSGS } from "actions/types";

const initialState = {
	mySurkl: {},
	msgs: []
};

export default function(state = initialState, action) {
	switch (action.type) {
		case UPDATE_SURKL_MSGS:
		return {
			...state,
			msgs: action.payload
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
