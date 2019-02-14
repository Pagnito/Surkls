import {UPDATE_DASHBOARD } from 'actions/types';
//import { isEmpty } from '../../tools/isEmpty';
const initialState = {
	newsSources: [],
	sourcesObj: {},
  activeSources: [],
  feed: [],
	chat: [],
	activeFeed: {},
	search1:'',
	search2:'',
	search3: ''
};

export default function(state = initialState, action) {
	switch (action.type) {
		case UPDATE_DASHBOARD:
			return {
				...state,
				...action.payload
			};	
		default:
			return state;
	}
}
