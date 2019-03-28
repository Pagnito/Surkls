import React, { Component } from 'react'
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {updateSurkl, newSurklAdmin, leaveSurkl, destroySurkl} from 'actions/settings-actions';
import './Surkls-settings.scss';
class SurklsSettings extends Component {
  constructor(props){
    super(props);
    this.state = {
      tab: 'my-surkl',
      currTab: 'my-surkl',
      mySurkl: '',
      otherSurkl: '',
      name: '',
      motto: '',
      saveName: 'Save',
      saveMotto: 'Save',
      sendNotice: 'Send',
      voteMem: 'Vote',
      appointMem: 'Appoint',
      showConfirmLeave: false,
      showConfirmDestroy: false,
      members: [],
      newAdmin: ''
    }
  }

  componentDidMount(){
    
    if(this.props.auth.user.mySurkl && this.props.auth.user.memberOf){
      fetch('/api/surkl/'+this.props.auth.user.mySurkl.surkl_id)
      .then(res=>res.json())
      .then((surkl)=>{
        this.setState({
          bannerUrl: surkl.bannerUrl,
          surkl_id: surkl._id,
          surkl_admin: surkl.admin.user_id,
          mySurkl:surkl.name, 
          otherSurkl:this.props.auth.user.memberOf.name,
          motto: surkl.motto,
          name:surkl.name,
          members:surkl.members
        })
      })
      
    } else if(this.props.auth.user.mySurkl && !this.props.auth.user.memberOf ) {
      fetch('/api/surkl/'+this.props.auth.user.mySurkl.surkl_id)
      .then(res=>res.json())
      .then((surkl)=>{
        this.setState({
          bannerUrl: surkl.bannerUrl,
          surkl_id: surkl._id,
          surkl_admin: surkl.admin.user_id,
          mySurkl:surkl.name, 
          motto: surkl.motto,
          name:surkl.name,
          members:surkl.members
        })
      })
    } else if(this.props.auth.user.memberOf) {
      this.setState({
        surkl_id: this.props.auth.user.memberOf.surkl_id,
        otherSurkl:this.props.auth.user.memberOf.name, 
        tab: 'other-surkl',
        currTab: 'other-surkl'
      })
    }
  }
  feedMembers = () =>{
    return this.state.members.map(mem=>{
      return <option key={mem.user_id} value={JSON.stringify(mem)}>{mem.userName}</option>
    })
  }
  
  onInput = (e) =>{
    this.setState({[e.target.name]: e.target.value})
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
  confirm = (type, func) =>{
    return (
      <div className='confirm-wrap'>
        Are You Sure?
        <div onClick={func} className="set-confirm-yes">Yes</div>
        <div onClick={()=>this.setState({[type]: false})} className="set-confirm-no">No</div>
      </div>
    )
  }
  leaveSurklBtn = () =>{
    if(this.state.showConfirmLeave===true){
      return this.confirm('showConfirmLeave',this.leaveSurkl)
    } else if(this.state.showConfirmLeave==='new-admin'){
      return <div id="need-new-admin">You must pick a new Admin</div>
    } else {
      return <div onClick={()=>this.setState({showConfirmLeave: true})} className="surkl-outwrap-btn leave-surkl">Leave Surkl</div>
    }
  }
  destroySurklBtn = () =>{
    if(this.state.showConfirmDestroy){
      return this.confirm('showConfirmDestroy',this.destroySurkl)
    } else {
      return <div onClick={()=>this.setState({showConfirmDestroy: true})} className="surkl-outwrap-btn destroy-surkl">Destroy Surkl</div>
    }
  }
  leaveSurkl = () =>{
    if(this.props.auth.user.mySurkl){
      this.setState({showConfirmLeave: 'new-admin'}, ()=>{
        setTimeout(()=>{
          this.setState({showConfirmLeave:false})
        },1500)
      })
    } else {
      this.props.leaveSurkl(this.state.surkl_id, ()=>{
        this.props.history.push('/')
      })
    }
  }
  destroySurkl = () =>{
    this.props.destroySurkl(this.state.surkl_id,()=>{
      this.props.history.push('/')
    })
  }
  appointNewAdmin = () =>{
    let newAdmin = {
      admin: JSON.parse(this.state.newAdmin),
      name: this.state.name,
      surkl_id: this.state.surkl_id,
      bannerUrl: this.state.bannerUrl
    }
    this.props.newSurklAdmin(JSON.stringify(newAdmin), this.props.auth.user.mySurkl.surkl_id, ()=>{
      this.setState({appointMem: 'Done'},()=>{
        setTimeout(()=>{
          this.setState({appointMem: 'Appoint'})
        },1000)
      })
    })
  }
  changeName = () =>{
    let obj = {
      name: this.state.name
    }
    this.props.updateSurkl(JSON.stringify(obj), this.props.auth.user.mySurkl.surkl_id, ()=>{
      this.setState({saveName: 'Done'},()=>{
        setTimeout(()=>{
          this.setState({saveName:'Save'})
        },1000)
      })
    })
  }
  changeMotto = () =>{
    let obj = {
      motto: this.state.motto
    }
    this.props.updateSurkl(JSON.stringify(obj), this.props.auth.user.mySurkl.surkl_id, ()=>{
      this.setState({saveMotto: 'Done'},()=>{
        setTimeout(()=>{
          this.setState({saveMotto:'Save'})
        },1000)
      })
    })
  }
  voteMemberOut = () =>{
    
  }
  sendNotice = () =>{
    
  }
  mySurklTabWin = () =>{
    return (
      <div className="mysurkl-tab-win s-tab-win">
        <div className="surkl-tab-primary">
          <div className="surkl-set-banner">
            <div className="surkl-set-logo"></div>
          </div>
          <div className="surkl-set-wrap set-wrap1">
            <div className="surkl-inwrap-btn rename-surkl">Rename Surkl</div>
            <div className="surkl-set-input-n-btn">
              <input value={this.state.name} onChange={this.onInput} className="surkl-set-input" name="name" placeholder="Enter new name" />
              <button onClick={this.changeName} type="button" className="set-surkl-save-btn">{this.state.saveName}</button>
            </div>
          </div>
          <div className="surkl-set-wrap">
            <div className="surkl-inwrap-btn rename-surkl">Change Motto</div>
            <div className="surkl-set-input-n-btn">
              <input value={this.state.motto} onChange={this.onInput} className="surkl-set-input" name="motto" placeholder="Enter new motto" />
              <button onClick={this.changeMotto} type="button" className="set-surkl-save-btn">{this.state.saveMotto}</button>
            </div>     
          </div>
          <div className="surkl-set-wrap">
            <div className="surkl-inwrap-btn rename-surkl">Vote a member out</div>
            <div className="surkl-set-input-n-btn">
               <input onChange={this.onInput} className="surkl-set-input" name="member" placeholder="Enter member name" />
               <button  type="button" className="set-surkl-save-btn">{this.state.voteMem}</button>
            </div>       
          </div>
          <div className="surkl-set-wrap">
            <div className="surkl-inwrap-btn rename-surkl">Appoint new Admin</div>
            <div className="surkl-set-input-n-btn">
               <select name="newAdmin" onChange={this.onInput} className="surkl-set-select">
                 <option>Members      
                 </option>
                 {this.feedMembers()}
               </select>
               <button  onClick={this.appointNewAdmin}type="button" className="set-surkl-save-btn">{this.state.appointMem}</button>
            </div>       
          </div>
          <div className="surkl-set-wrap2">
            <div className="surkl-inwrap-btn rename-surkl">Send out a notice</div>
            <div className="surkl-set-input-n-btn2">
               <textarea onChange={this.onInput} className="surkl-set-text" name="notice" placeholder="Type in your notice" />
               <button type="button" className="set-surkl-notice-btn">{this.state.sendNotice}</button>
            </div>     
          </div>
          <div className="surkl-outwrap-btn ev">Create an event</div>
          {this.leaveSurklBtn()}
          {this.destroySurklBtn()}
        </div>     
      </div>
    )
  }
  otherSurklTabWin = () =>{
    return (
      <div className="other-surkl-tab-win s-tab-win">
         <div className="surkl-tab-primary">
          {this.leaveSurklBtn()}
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
      style={{borderBottom:this.state.tab==='my-surkl' ? '1px #242323 solid' : '1px #3E3E3E solid'}} id="my-surkl" className="s-tab">{this.state.mySurkl}</div>
      : ''
     let other = this.state.otherSurkl.length>0 ? 
      <div onClick={()=>this.switchTab('other-surkl',this.state.currTab)} 
      style={{borderBottom:this.state.tab==='other-surkl' ? '1px #242323 solid' : '1px #3E3E3E solid'}}
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

SurklsSettings.propTypes = {
  surkl: PropTypes.object,
  auth: PropTypes.object,
  updateSurkl: PropTypes.func,
  leaveSurkl: PropTypes.func,
  history: PropTypes.object,
  newSurklAdmin: PropTypes.func,
  destroySurkl: PropTypes.func
}
export default connect(null, {updateSurkl, leaveSurkl, newSurklAdmin, destroySurkl})(withRouter(SurklsSettings))