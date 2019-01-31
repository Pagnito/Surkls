import {GET_SESSIONS } from "actions/types";
/* import {isEmpty} from '../../tools/isEmpty'; */

const initialState = {
	sessions: []
};

export default function(state = initialState, action) {
	switch (action.type) {
			case GET_SESSIONS:
				return {			
					sessions: action.payload
				};
		default:
			return state;
	}
}
