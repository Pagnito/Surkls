import {
  MY_SURKL
  } from 'actions/types';
  
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
      cb(data)
    })
  }
  