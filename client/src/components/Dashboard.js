import React, { Component } from 'react'
import {connect} from 'react-redux';

class Dashboard extends Component {

  renderModal = () =>{
    return (
      <div id="uploadImgModal">
        
      </div>
    )
  }
  render() {
    return (
      <div>
        
      </div>
    )
  }
}
function stateToProps(state){
  return {
    auth: state.auth.user
  }
}
export default connect(stateToProps)(Dashboard);