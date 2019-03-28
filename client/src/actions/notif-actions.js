import {
  LOAD_NOTIFS,
  UPDATE_NOTIFS,
  ADD_NOTIF,
  REMOVE_NOTIF
  } from 'actions/types';
  
  export const updateNotifs = (payload) =>{
    return {
      type: UPDATE_NOTIFS,
      payload:payload
    }
  }
  export const addNotif = (payload) =>{
    return {
      type: ADD_NOTIF,
      payload:payload
    }
  }
  export const removeNotif = (payload) =>{
    return {
      type: REMOVE_NOTIF,
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