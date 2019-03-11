import {
  MY_SURKL, USER_SURKL, UPDATE_SURKL_MSGS
  } from 'actions/types';
  
  export const updateMsgs = (msgs) =>{
    return {
      type: UPDATE_SURKL_MSGS,
      payload:msgs
    }
  }
  export const fetchMySurkl = (id) => (dispatch)=>{
    fetch('/api/surkl/'+id).then(res=>res.json())
      .then(data=>{
        dispatch({
          type:MY_SURKL,
          payload:data
        })
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
        type: MY_SURKL,
        payload: data
      })
      dispatch({
        type: USER_SURKL,
        payload: data
      })
      cb(data)
    })
  }
  