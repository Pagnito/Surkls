import React, { Component } from 'react'
import './Surkls-settings.scss';
class SurklsSettings extends Component {
  constructor(props){
    super(props);
    this.state = {
      tab: 'my-surkl',
      currTab: 'my-surkl'
    }
  }
  renderTabWindows = () =>{
    if(this.state.tab==='my-surkl'){
      return this.mySurklTabWin()
    } else {
      return this.otherSurklTabWin()
    }
  }
  switchTab=(tab, currTab)=>{
    document.getElementById(currTab).style.borderBottom = '1px solid #F4FBFB';
    document.getElementById(tab).style.borderBottom = '1px solid #242323';
    this.setState({tab:tab, currTab:tab})
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
  render() {
    return (
      <div id="surkls-settings">
        <div id="s-tabs">
          <div onClick={()=>this.switchTab('my-surkl',this.state.currTab)} id="my-surkl" className="s-tab">My Surkl</div>
          <div onClick={()=>this.switchTab('other-surkl',this.state.currTab)} id="other-surkl" className="s-tab">Other Surkl</div>     
        </div>
        {this.renderTabWindows()}
      </div>
    )
  }
}
export default SurklsSettings