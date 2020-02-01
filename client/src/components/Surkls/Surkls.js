import React, { Component } from 'react';
import {connect} from 'react-redux';
import {requestToJoinSurkl, fetchSurkls} from 'actions/actions';
import {PropTypes} from 'prop-types';
import './surkls.scss';
 class Surkls extends Component {
   constructor(props){
     super(props);
     this.state = {
       surkls: []
     }
   }
  componentDidMount(){
     fetch('/api/surkls').then(res=>res.json())
     .then(surkls=>{
      this.setState({surkls})
     })
   }
  requestToJoinSurkl = (surkl) =>{
    let request = {
      admin_id: surkl.admin.user_id,
      userName:this.props.auth.user.userName,
      user_id:this.props.auth.user._id,
      avatarUrl:this.props.auth.user.avatarUrl,
      surkl_id: surkl.surkl_id
    }
    this.props.requestToJoinSurkl(JSON.stringify(request));
    let btn = document.getElementById('goog-ani');
    btn.classList.add('request-animation');
  }
  requestToJoinSurklButton = (surkl) =>{
    if(this.props.auth.user){
      let memberOf = this.props.auth.user.memberOf ? this.props.auth.user.memberOf.surkl_id : null;
      let ownerOf = this.props.auth.user.mySurkl ? this.props.auth.user.mySurkl.surkl_id : null;
      if( memberOf === surkl._id || ownerOf === surkl._id){
        return <div id="btnn"  className="surkls-surkl-btn">Member
        </div>
      } else {
        return <div onClick={() => this.requestToJoinSurkl(surkl)} className="surkls-surkl-actionbtn" >Join Surkl
        <div id="goog-ani"></div></div>
      }
    }
   
  }
  
   displaySurkls = () => {
     return this.state.surkls.map((surkl, ind)=>{
      return (
        <div key={ind} className="surkl">
          <div className="surkls-surkl-banner">
            <div className="surkls-surkl-logo"></div>
          </div>
          <div className="surkls-surkl-info">
            <div className="surkls-surkl-name">{surkl.name}</div>
            <div className="surkls-surkl-motto">{'"'+surkl.motto+'"'}</div>
          </div>
          <div className="surkls-surkl-top-users">
            {surkl.members.map((member, ind)=>{
              return (
                <img key={ind} src={member.avatarUrl} className="surkls-surkl-member"/>
              )
            })}
          </div>
          <div className="surkls-surkl-actionbtns">
            {this.requestToJoinSurklButton(surkl)}
          </div>
        </div>
      )
     })
   }

  render() {
    return (
      <div id="surkls-list">
        {this.displaySurkls()}
      </div>
    )
  }
}
Surkls.propTypes = {
  auth:PropTypes.object,
  fetchSurkls: PropTypes.func,
  requestToJoinSurkl: PropTypes.func
}
function stateToProps(state){
  return{
    auth:state.auth

  }
}
export default connect(stateToProps,{fetchSurkls,requestToJoinSurkl})(Surkls);