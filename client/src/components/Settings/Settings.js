import React, { Component } from 'react';
import AccountSettings from './Account/Account-settings';
import SurklsSettings from './Surkls/Surkls-settings';
import NotifSettings from './Notifications/Notif-settings';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import "./settings.scss"
class Settings extends Component {
  constructor(props){
    super(props);
    this.state = {
      setting: 'account',
      prevTab: 'account-tab'
    }
  }

  swtichSetting = (setting, settingTab)=>{
    document.getElementById(this.state.prevTab).style.backgroundColor = "#242323"
    document.getElementById(this.state.prevTab).style.color = "#F4FBF4"
    document.getElementById(settingTab).style.backgroundColor = "#3F3E3E"
    document.getElementById(settingTab).style.color = "#F6C641"
    this.setState({
      setting: setting,
      prevTab: settingTab
    })
  }
   renderSettingsType = () =>{
    if(this.state.setting==='account'){
      return <AccountSettings auth={this.props.auth}/>
    } else if(this.state.setting === 'surkls'){
      return <SurklsSettings auth={this.props.auth}/>
    } else if(this.state.setting === 'notifs'){
      return <NotifSettings auth={this.props.auth}/>
    }
    
  }
  
  render() {
    return (
      <div id="settings">
        <div id="settings-nav">
          <div onClick={()=>this.swtichSetting('account', 'account-tab')} id="account-tab" className="setting-type">Account</div>
          <div onClick={()=>this.swtichSetting('surkls', 'surkls-tab')} id="surkls-tab" className="setting-type">Surkls</div>
          <div onClick={()=>this.swtichSetting('notif', 'notif-tab')} id="notif-tab" className="setting-type">Notifications</div>
        </div>
        <div id="settings-actions">
          {this.renderSettingsType()}
        </div>
      </div>
    )
  }
}
Settings.propTypes = {
  auth: PropTypes.object
}
function stateToProps(state){
  return {
    auth: state.auth,
    surkl: state.surkl,

  }
}
export default connect(stateToProps)(Settings);