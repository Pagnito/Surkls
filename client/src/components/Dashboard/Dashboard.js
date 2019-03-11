import React, { Component } from 'react'
import {connect} from 'react-redux';
import { closeMenus} from 'actions/actions';
import {fetchMySurkl, updateMsgs} from 'actions/surkl-actions'
import PropTypes from 'prop-types';
import "./dashboard.scss";
class Dashboard extends Component {
  constructor(props){
    super(props)
    this.state = {
      msg: ''
    }
    this.surklFetched = false;
    this.joinedRoom = false;
    this.socket = this.props.socket;
    this.socket.on('receive-surkl-msgs', (msgs)=>{
      this.props.updateMsgs(msgs)
    })
  }

  componentDidMount(){
    this.joinSurklRoom()
    this.props.fetchMySurkl(this.props.match.params.id)
    this.socket.emit('fetch-surkl-msgs',this.props.match.params.id)
  }
  componentDidUpdate(prevProps){
    if (this.props.surkl.msgs !== prevProps.surkl.msgs) {
			const chatBox = document.getElementById('surkl-feed');
			if (chatBox !== null) {
				chatBox.scrollTop = chatBox.scrollHeight;
			}
		} 
  }
  closeMenus = () =>{
    if(this.props.app.menuState === 'open'){
      this.props.closeMenus({menu:'close-menus'});
    }	
	}
 displayMembers = () => {
   let members = this.props.surkl.mySurkl.members;
   if(members){
    return members.map((member,ind)=>{
      return (
        <div key={ind} className="surkl-member">
           <div className="surkl-member-avatar"
            style={{backgroundImage:`url(${member.avatarUrl}`,
                    backgroundPosition:'center',
                    backgroundSize:'cover'}}></div>
           <div className="surkl-member-name">{member.userName}</div>
        </div>
      )
    })
   } 
  }

 joinSurklRoom = () =>{
   this.socket.emit('join-surkl-room', this.props.match.params.id )
 }
 sendSurklMsg = (e) => {
  if(e.key=='Enter'){
    e.preventDefault()
    let msg = {
      msg: this.state.msg,
      userName: this.props.auth.user.userName,
      avatarUrl: this.props.auth.user.avatarUrl,
      surkl_id: this.props.match.params.id,
      date: Date.now()
    }
    this.setState({msg:''})
    this.socket.emit('surkl-msg', msg)
  }
 }
 
  onInput = (e) =>{
    this.setState({[e.target.name]: e.target.value})
  }
  

 

  
displayMsgs = () => {
  return this.props.surkl.msgs.map((msg,ind)=>{ 
		let url = msg.avatarUrl ? msg.avatarUrl : '/assets/whitehat.jpg'
		return (	
			<div key={ind} className="surkl-chat-msg">	
				<img data-user={JSON.stringify(msg)} className="surkl-chat-msgAvatar" src={url} />
					<div className="surkl-chat-HeaderNmsg">
						<div className="surkl-chat-MsgUserInfo">
							<div className="surkl-chat-MsgName">{msg.userName}</div>
							<div className="surkl-chat-MsgDate">{msg.date}</div>
						</div>
						<div className="surkl-chat-MsgText">{msg.msg}</div>
					</div>
				</div>
			);
		});
}

  render() {
    if(this.props.auth.isAuthenticated){
      return (
        <div onClick={this.closeMenus} id="surkl">
          <section id="newsSources">
            <div id="newsSourcesHeader">Sessions</div>
            <div id="newsSourcesFeed"></div>      
           </section>
          <section id="surkl-center">
            <div id="feedInputs">
              {/* <input onChange={this.onInputChange} onKeyDown={this.onEnter} value={this.props.surkl.search1} id="dashSearch1" className="dashSearch" name="search1" placeholder="Subscribe to a topic"/>*/}
            </div>
          <div id="surkl-feed">
          {this.displayMsgs()}
          </div>
          <textarea
						value={this.state.msg}
						onChange={this.onInput}
						onKeyDown={this.sendSurklMsg}
						name="msg"
						placeholder="Type here to chat"
						id="surkl-chat-input"
						/>
          </section>
         <section id="surkl-members">
            <div id="surkl-members-header">My Surkl</div>
            <div id="my-surkl-members">{this.displayMembers()}</div>
         </section>
        </div>
      )
    } else {
      return (
        <div id="notLoggedIn">You are not logged in</div>
      )
    }
   
  }
}
Dashboard.propTypes = {
  auth: PropTypes.object,
  updateDashboard: PropTypes.func,
  closeMenus: PropTypes.func,
  app: PropTypes.object,
  fetchMySurkl: PropTypes.func,
  surkl: PropTypes.object,
  socket: PropTypes.object,
  match: PropTypes.object,
  updateMsgs: PropTypes.func
}
function stateToProps(state){
  return {
    auth: state.auth,
    app: state.app,
    surkl: state.surkl
  }
}
export default connect(stateToProps, {closeMenus, fetchMySurkl, updateMsgs})(Dashboard);