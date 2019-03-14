import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './account-settings.scss';
class AccountSettings extends Component {
  constructor(props){
    super(props);
    this.state = {
      tab: 'account-tab',
      currTab: 'account-tab',
      userName: '',
      email: '',
      description: '',
      quote: '',
    }
    this.defaultBanner = "url('/assets/surkls-banner.png')"
  }
  onInput = (e)=>{
    this.setState({[e.target.name]: e.target.value})
  }
  switchTab =(tab, currTab)=>{
    document.getElementById(currTab).style.borderBottom = '1px solid #F4FBFB';
    document.getElementById(tab).style.borderBottom = '1px solid #242323';
    this.setState({tab:tab, currTab:tab})
  }
  componentDidMount(){
    if(this.props.auth.isAuthenticated){
      let user = this.props.auth.user;
    this.setState({
      userName:user.userName,
      email: user.email,
      
    })
    } 
  }
  componentDidUpdate(prevProps){
    if(this.props.auth!==prevProps.auth){
      let user = this.props.auth.user;
    this.setState({
      userName:user.userName,
      email: user.email,
      
    })
    } 
  }
  profileTab = () =>{
    if(this.props.auth.isAuthenticated){
      return (
        <div className="account-tab-win tab-win">
           <div id="tab-banner-n-avatar">
            <div style={{backgroundImage:this.defaultBanner,
                        backgroundPosition:'center',
                        backgroundRepeat:'no-repeat',
                        backgroundSize:'cover'}} id="tab-banner"></div>
            <div style={{backgroundImage:`url(${this.props.auth.user.avatarUrl})`,
                        backgroundPosition:'center',
                        backgroundRepeat:'no-repeat',
                        backgroundSize:'cover'}} id="tab-avatar"></div>
           </div> 
          <form className="account-tab-form">
            <label htmlFor="tab-username">Username</label>
            <input name="userName" onChange={this.onInput} value={this.state.userName} id="tab-username" className="tab-username-input tab-input"/>
            <label htmlFor="tab-email">Email</label>
            <input name="email" onChange={this.onInput}  value={this.state.email} id="tab-email" type="email" className="tab-email-input tab-input"/>
            <label htmlFor="tab-quote">Favorite Quote</label>
            <input name="quote" onChange={this.onInput}  value={this.state.quote} id="tab-quote" className="tab-quote-input tab-input"/>
            
          </form> 

        </div>
      )
    }
    
  }
  /* basicsTab = () =>{
    return (
      <div className="basics-tab-win tab-win">

      </div>
    )
  }
  appearTab = () =>{
    return (
      <div className="appear-tab-win tab-win">

      </div>
      )
  } */
  renderTab = () =>{
   if(this.state.tab ==='account-tab'){
     return this.profileTab()
    } else if(this.state.tab ==='appear-tab'){
      return this.appearTab()
    } else if(this.state.tab ==='basics-tab'){
      return this.basicsTab()
    }
  }
  render() {
    return (
      <div id="account-settings">
      {/*   <div id="tabs">
          <div onClick={()=>this.switchTab('profile-tab',this.state.currTab)} id="profile-tab" className="tab profile-tab">Profile</div>
          <div onClick={()=>this.switchTab('basics-tab',this.state.currTab)} id="basics-tab" className="tab">Basic info</div> 
          <div id="account-tab" className="tab">Account</div>
        </div> */}
        {this.renderTab()}
      </div>
    )
  }
}
AccountSettings.propTypes = {
  auth: PropTypes.object
}
export default AccountSettings