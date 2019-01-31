import {START_SESSION, JOIN_SESSION } from "actions/types";
import {isEmpty} from '../../tools/isEmpty';
const initialState = {
	inSession: false
};

export default function(state = initialState, action) {
	switch (action.type) {
		case START_SESSION:
			return {
				...state,
				inSession: !isEmpty(action.payload),
				room: action.payload,
				creatingSession:true
			};
			case JOIN_SESSION:
				return {
					...state,
					inSession: !isEmpty(action.payload),
					room: action.payload,
					creatingSession: false
				};
		default:
			return state;
	}
}
