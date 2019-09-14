import { UPDATE_SURKL_MSGS, UPDATE_SESSION_MSGS } from './types';
export const updateMsgs = (msgs, type) => (dispatch) => {
  switch(type){
    case 'surkl':
      dispatch({
        type: UPDATE_SURKL_MSGS,
        payload:msgs === null ? [] : msgs
      })
      break;
    case 'session':
      dispatch({
        type: UPDATE_SESSION_MSGS,
        payload:msgs === null ? [] : msgs
      })
    }
}