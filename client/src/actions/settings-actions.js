import {
 SET_USER,
 SET_GUEST
  } from 'actions/types';
  export const deleteAccount = (cb) => (dispatch) =>{
    let options = {
      method: 'DELETE',
      mode: 'cors',
    };
    fetch('/account/delete', options)
    .then(res=>res.json())
    .then(()=>{
      dispatch({
        type: SET_GUEST,
        payload: {guest:{
					_id: Math.random().toString(36).substring(2, 15),
					avatarUrl: '/assets/whitehat.jpg',
					userName: 'Guest'+Math.random().toString(36).substring(2, 15),
					isAdmin:false,
					guest: true
				}}
      })
      cb()
    })
  }
  export const updateUsername = (user, cb) => (dispatch) =>{
    let options = {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: user
    };
    fetch('/api/user/update/username/', options)
    .then(res=>res.json())
    .then(data=>{
      dispatch({
        type: SET_USER,
        payload: data ? data : {}
      })
      cb()
    })
  }
  export const updateUser = (user, cb) => (dispatch) =>{
    let options = {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: user
    };
    fetch('/api/user/update/', options)
    .then(res=>res.json())
    .then(data=>{
      dispatch({
        type: SET_USER,
        payload: data ? data : {}
      })
      cb()
    })
  }