import React, { Component } from 'react'
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import './Surkls-settings.scss';
class SurklsSettings extends Component {
  constructor(props){
    super(props);
    this.state = {
      tab: 'my-surkl',
      currTab: 'my-surkl',
      mySurkl: '',
      otherSurkl: ''
    }
  }

  componentDidMount(){
    if(this.props.auth.user.mySurkl && this.props.auth.user.memberOf){
      this.setState({
        mySurkl:this.props.auth.user.mySurkl.name, 
        otherSurkl:this.props.auth.user.memberOf.surkl_name 
      })
    } else if(this.props.auth.user.mySurkl && !this.props.auth.user.memberOf ) {
      this.setState({
        mySurkl:this.props.auth.user.mySurkl.name, 
      })
    } else {
      this.setState({
        otherSurkl:this.props.auth.user.memberOf.surkl_name, 
        tab: 'other-surkl',
        currTab: 'other-surkl'
      })
    }

  }
  renderTabWindows = () =>{
    if(this.state.tab==='my-surkl'){
      return this.mySurklTabWin()
    } else {
      return this.otherSurklTabWin()
    }
  }
  switchTab=(tab)=>{
    this.setState({tab:tab})
  }
  mySurklTabWin = () =>{
    return (
      <div className="mysurkl-tab-win s-tab-win">
        <div className="surkl-tab-primary">
          <div className="surkl-set-banner">
            <div className="surkl-set-logo"></div>
          </div>
          <div className="surkl-set-btn">Rename Surkl</div>
          <div className="surkl-set-btn">Change Motto</div>
          <div className="surkl-set-btn">Create an event</div>
          <div className="surkl-set-btn">Vote a member out</div>
          <div className="surkl-set-btn">Send out a notice</div>
          <div className="surkl-set-btn leave-surkl">Leave Surkl</div>
          <div className="surkl-set-btn destroy-surkl">Destroy Surkl</div>
        </div>     
      </div>
    )
  }
  otherSurklTabWin = () =>{
    return (
      <div className="other-surkl-tab-win s-tab-win">
         <div className="surkl-tab-primary">
          <div className="surkl-set-btn leave-surkl">Leave Surkl</div>
        </div>  
      </div>
      )
  } 
 
  renderTab = () =>{
    if(this.state.tab ==='my-surkl'){
      return this.mySurklTab()
     } else if(this.state.tab ==='fck-boiz'){
       return this.otherSurklTab()
     }
   }
   renderTabBtns = () =>{
     let mySurkl = this.state.mySurkl.length>0 ?
      <div onClick={()=>this.switchTab('my-surkl',this.state.currTab)} 
      style={{borderBottom:this.state.currTab==='my-surkl' ? '1px #242323 solid' : '1px #3E3E3E solid'}} id="my-surkl" className="s-tab">{this.state.mySurkl}</div>
      : ''
     let other = this.state.otherSurkl.length>0 ? 
      <div onClick={()=>this.switchTab('other-surkl',this.state.currTab)} 
      style={{borderBottom:this.state.currTab==='other-surkl' ? '1px #242323 solid' : '1px #3E3E3E solid'}}
      id="other-surkl" className="s-tab">{this.state.otherSurkl}</div>
      : ''
    return (
      <div id="s-tabs">
        {mySurkl}
        {other} 
      </div>
    )
   }
  render() {
    return (
      <div id="surkls-settings">
        {this.renderTabBtns()}
        {this.renderTabWindows()}
      </div>
    )
  }
}
function stateToProps(state){
  return {
    surkl: state.surkl
  }
}
SurklsSettings.propTypes = {
  surkl: PropTypes.object,
  auth: PropTypes.object
}
export default connect(stateToProps)(SurklsSettings)