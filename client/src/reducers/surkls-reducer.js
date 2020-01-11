import { JOIN_SURKL_REQ_SENT } from "actions/types";
//import {isEmpty} from '../../tools/isEmpty';
const initialState = {
  surkls: [],
  requestSent: false
};

export default function(state = initialState, action) {
	switch (action.type) {
    case SURKLS_FETCHED:
			return {
				...state,
				surkls: action.payload
			}
		case JOIN_SURKL_REQ_SENT:
			return {
				...state,
				...action.payload
			}
		default:
			return state;
	}
}
