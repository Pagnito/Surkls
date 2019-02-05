import { SET_USER, GET_USER } from "actions/types";
import {isEmpty} from '../../tools/isEmpty';
const initialState = {
	isAuthenticated: false,
	user: null
};

export default function(state = initialState, action) {
	switch (action.type) {
		case GET_USER:
			return {
				...state,
				isAuthenticated: !isEmpty(action.payload),
				user: action.payload
			};
		case SET_USER:
			console.log(action.payload)
			return {
				...state,
				isAuthenticated: !isEmpty(action.payload),
				user: action.payload
			}
		default:
			return state;
	}
}
