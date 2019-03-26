import { MY_SURKL, UPDATE_SURKL_MSGS, UPDATE_SURKL, UPDATE_ON_MEMBERS, UPDATE_YTPLAYER } from "actions/types";

const initialState = {
	mySurkl: {},
	activeSurkl: {},
	msgs: [],
	online: [],
	justMounted: true,
	audio_id:'',
	artist: 'Artist',
	title: 'Title',
	audio_dur:0,
	audio_time: 0,
	volume: 0,
	currTime: null
};

export default function(state = initialState, action) {
	switch (action.type) {
		case UPDATE_YTPLAYER:
			return {
				...state,
				...action.payload
			}
		case UPDATE_SURKL:
			return {
				...state,
				activeSurkl: action.payload
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
				activeSurkl: action.payload
			};
		
		default:
			return state;
	}
}
