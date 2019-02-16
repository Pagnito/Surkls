import { OPEN_DMS, SEND_DM } from "actions/types";
//import {isEmpty} from '../../tools/isEmpty';
const initialState = {
	sendToId: ''
};

export default function(state = initialState, action) {
	switch (action.type) {
		case OPEN_DMS:
			return {
				...state,
				...action.payload
			};
		default:
			return state;
	}
}
