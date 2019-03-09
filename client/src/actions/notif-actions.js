import {
  LOAD_NOTIFS,
  UPDATE_NOTIFS
  } from 'actions/types';
  
  export const updateNotifs = (payload) =>{
    return {
      type: UPDATE_NOTIFS,
      payload:payload
    }
  }
  export const fetchNotifs = (id) => (dispatch) =>{
    fetch('/api/notifs/'+id)
    .then(res=>res.json())
    .then(data=>{
      dispatch({
        type: LOAD_NOTIFS,
        payload: data ? data : []
      })
    })
  }