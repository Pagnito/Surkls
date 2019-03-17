import React from 'react';
import PropTypes from 'prop-types';
import './loader1.scss';
export default function Loader1() {
  return ( 
    <div id="spinnerWrap">
      <div className="spinner"></div>
  </div> 
 
  )
}
Loader1.propTypes = {
  color: PropTypes.string
}