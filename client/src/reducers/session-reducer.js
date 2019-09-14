import {
	START_SESSION,
	JOIN_SESSION,
	UPDATE_SESSION,
	SEND_VIDEO,
	UNPICK_VIDEO,
	NEW_ADMIN,
	SEND_TWEET,
	REMOVE_KEYS,
	UPDATE_SESSION_MSGS
} from 'actions/types';
import { isEmpty } from '../../tools/isEmpty';
const initialState = {
	inSession: false,
	youtubeList: [],
	dailymotionList: [],
	twitchList:[],
	twitchers: [],
	twitchStreams: [],
	tweets: [],
	twitters: [],
	activePlatform: 'youtube',
	tweetId: '',
	twitterId: '',
	trends: [],
	playing: false,
	videoId:'',
	msgs: [],
	clients: [],
/* 	twitchVidId: '',
	youtubeVidId: '',
	dailymotionVidId: '', */
	requestingTime: false
};

export default function(state = initialState, action) {
	switch (action.type) {
		case REMOVE_KEYS: 
			let stateClone = JSON.parse(JSON.stringify(state))
			action.payload.forEach(key => {
				delete stateClone[key] 
			})
			return {
				...stateClone
			}
		case NEW_ADMIN:
			return {
				...state,
				...action.payload
			};
		case SEND_TWEET:
			return {
				...state,
				...action.payload
			};
		case SEND_VIDEO:
			return {
				...state,
				...action.payload
			};
		case UNPICK_VIDEO:
			return {
				...state,
				... action.payload
			};
		case UPDATE_SESSION:
			return {
				...state,
				...action.payload
			};
		case UPDATE_SESSION_MSGS:
			return {
				...state,
				msgs:action.payload
			}
		case START_SESSION:
			return {
				...state,
				inSession: !isEmpty(action.payload),
				...action.payload,
				creatingSession: true
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
