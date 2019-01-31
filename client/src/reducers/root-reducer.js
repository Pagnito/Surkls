import { combineReducers } from 'redux';
import SessionReducer from 'reducers/session-reducer';
import SessionsReducer from 'reducers/sessions-reducer';
import AuthReducer from 'reducers/auth-reducer';

export default combineReducers({
  auth: AuthReducer,
  session: SessionReducer,
  sessions: SessionsReducer
});
