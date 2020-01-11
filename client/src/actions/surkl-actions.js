import {
  CREATED_SURKL, USER_SURKL, UPDATE_ON_MEMBERS, UPDATE_YTPLAYER, UPDATE_SURKL, JOIN_SURKL_REQ_SENT
  } from 'actions/types';
  
  export const updateYTPlayer = (data) => {
    return {
      type: UPDATE_YTPLAYER,
      payload: data
    }
  }
  
  export const updateOnMembers = (users) =>{
    return {
      type: UPDATE_ON_MEMBERS,
      payload:users
    }
  }
  export const fetchSurkl = (id) => (dispatch)=>{
    fetch('/api/surkl/'+id).then(res=>res.json())
      .then(data=>{
        dispatch({
          type:UPDATE_SURKL,
          payload:data
        })
      })
  }
  export const updateSurkl = (surkl)=>{
    return {
      type:UPDATE_SURKL,
      payload:surkl
    }
  }
  export const requestToJoinSurkl = (requestObj) => (dispatch) =>{
    let options = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: requestObj
    };
    fetch('/api/surkl/user/joinReques', options)
    .then(res=>res.json())
    .then(data=>{
      dispatch({
        type: JOIN_SURKL_REQ_SENT,
        payload: true
      })
      cb(data)
    })
  }
  export const newSurkl = (surkl,cb) => (dispatch) =>{
    let options = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: surkl
    };
    fetch('/api/surkl/new', options)
    .then(res=>res.json())
    .then(data=>{
      dispatch({
        type: CREATED_SURKL,
        payload: data
      })
      dispatch({
        type: USER_SURKL,
        payload: data
      })
      cb(data)
    })
  }
  