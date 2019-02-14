import { CLOSE_ALLMENUS } from "actions/types";
//import {isEmpty} from '../../tools/isEmpty';
const initialState = {
	menus: ''
};

export default function(state = initialState, action) {
	switch (action.type) {
		case CLOSE_ALLMENUS:
			return {
				...state,
				menus: action.payload
			};
		
		default:
			return state;
	}
}
