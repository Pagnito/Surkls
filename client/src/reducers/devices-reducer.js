import {GET_DEVICES } from "actions/types";
import {isEmpty} from '../../tools/isEmpty';
const initialState = {
	devices: []
};

export default function(state = initialState, action) {
	switch (action.type) {
		case GET_DEVICES:
			return {
        ...state,
        devicesNotFound: isEmpty(action.payload),
				devices: action.payload
			};
		default:
			return state;
	}
}
