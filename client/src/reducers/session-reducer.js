import {
	START_SESSION,
	JOIN_SESSION,
	UPDATE_SESSION,
	SEND_VIDEO,
	UNPICK_VIDEO,
	NEW_ADMIN,
	SEND_TWEET
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
	activePlatform: 'dailymotion',
	tweetId: '',
	twitterId: '',
	trends: [],
	playing: false,
	videoId:'',
	twitchVidId: '',
	youtubeVidId: '',
	dailymotionVidId: '',
	requestingTime: false
};

export default function(state = initialState, action) {
	switch (action.type) {
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
