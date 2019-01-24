import {SET_CURRENT} from './types';
import axios from 'axios';
export const tester = () => dispatch => {
  axios.get('https://jsonplaceholder.typicode.com/todos/1').then((data)=>{
    dispatch({
      type: SET_CURRENT,
      payload: data.data
    });
  })
}
