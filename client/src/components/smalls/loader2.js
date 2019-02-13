import React from 'react';
import PropTypes from 'prop-types';
import 'styles/loader2.scss';
export default function Loader2(props) {
  return ( 
    <div className="loader2">
      <h1 style={{color:props.color}}>
      <span className="let1 let">l</span>  
      <span className="let2 let">o</span>  
      <span className="let3 let">a</span>  
      <span className="let4 let">d</span>  
      <span className="let5 let">i</span>  
      <span className="let6 let">n</span>  
      <span className="let7 let">g</span>  
    </h1>
  </div>  
 
  )
}
Loader2.propTypes = {
  color: PropTypes.string
}