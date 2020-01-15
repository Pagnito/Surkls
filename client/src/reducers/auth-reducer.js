import {
  CREATED_SURKL,
  SETUP_COMPLETE,
  DESTROYED_SURKL,
  SET_USER,
  GET_USER,
  UPDATE_USER_MEMBERSHIP,
  SET_GUEST,
  NEW_SURKL_ADMIN,
	LEFT_SURKL,
	ADD_NEW_USER_TO_DM_LIST
} from "actions/types";
import { isEmpty } from "../../tools/isEmpty";
const initialState = {
  isAuthenticated: false,
  user: null,
  socket_connected: false
};
let dms = {};
export default function(state = initialState, action) {
  switch (action.type) {
    case CREATED_SURKL:
      let clone0 = JSON.parse(JSON.stringify(state));
      clone0.user.mySurkl = action.payload;
      return {
        ...state,
        ...clone0
      };
    case SETUP_COMPLETE:
      return {
        ...state,
        socket_connected: true
      };
    case UPDATE_USER_MEMBERSHIP:
      let clone1 = JSON.parse(JSON.stringify(state));
      clone1.user.memberOf = action.payload;
      return {
        ...state,
        ...clone1
      };
    case GET_USER:
      if (action.payload.dms) {
        action.payload.dms.forEach(dm => (dms[dm.user_id] = dm));
        action.payload.dms = dms;
      }
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload,
        guest: {}
      };
    case SET_USER:
      if (action.payload.dms) {
        action.payload.dms.forEach(dm => (dms[dm.user_id] = dm));
        action.payload.dms = dms;
      }
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload,
        guest: {}
      };

    case SET_GUEST:
      return {
        ...state,
        isAuthenticated: false,
        user: {},
        ...action.payload
      };
    case DESTROYED_SURKL:
      let clone2 = JSON.parse(JSON.stringify(state));
      delete clone2.user.mySurkl;
      return {
        ...clone2
      };
    case LEFT_SURKL:
      let clone3 = JSON.parse(JSON.stringify(state));
      delete clone3.user.memberOf;
      return {
        ...clone3
      };
    case NEW_SURKL_ADMIN:
      let clone4 = JSON.parse(JSON.stringify(state));
      clone4.user.memberOf = {
        bannerUrl: action.payload.bannerUrl,
        name: action.payload.name,
        surkl_id: action.payload._id
      };
      delete clone4.user.mySurkl;
      return {
        ...clone4
      };
    case ADD_NEW_USER_TO_DM_LIST:
      let user = JSON.parse(JSON.stringify(state.user));
      user.dms[action.payload.user_id] = action.payload;
      return {
        ...state,
        user
      };
    default:
      return state;
  }
}
