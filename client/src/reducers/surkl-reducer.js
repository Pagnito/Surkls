import { MY_SURKL } from "actions/types";

const initialState = {
	mySurkl: {}
};

export default function(state = initialState, action) {
	switch (action.type) {
		case MY_SURKL:
			return {
				...state,
				mySurkl: action.payload
			};
		
		default:
			return state;
	}
}
