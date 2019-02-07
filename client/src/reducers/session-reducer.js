import {START_SESSION, JOIN_SESSION, UPDATE_SESSION, PLAY_VIDEO } from "actions/types";
import {isEmpty} from '../../tools/isEmpty';
const initialState = {
	inSession: false,
	videoId: ''
};

export default function(state = initialState, action) {
	switch (action.type) {
		case PLAY_VIDEO:
			return {
				...state,
				videoId: action.payload
			}
		case UPDATE_SESSION:
			return {
				...state,
				youtubeList: action.payload
			};
		case START_SESSION:
			return {
				...state,
				inSession: !isEmpty(action.payload),
				...action.payload,
				creatingSession:true
			};
			case JOIN_SESSION:
				return {
					...state,
					inSession: !isEmpty(action.payload),
					...action.payload,
					creatingSession: false
				};
		default:
			return state;
	}
}
