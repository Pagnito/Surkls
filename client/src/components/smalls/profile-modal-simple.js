import React from 'react';
import "./styles/profile-modal-simple.scss";
import PropTypes from 'prop-types';
function ProfileModal(props) {
  let user = props.user;
  let pos = props.position;
  

  if(!user.guest){
      return (
        <div id={props.id} style={pos} className="simpleProfileModal">
        <div className="simpleProfileBanner">
        <div className="simple-prof-modal-top-arrow-wrap">
          <div className="simple-prof-modal-top-arrow"></div>
        </div>
          <div style={{backgroundImage:`url(${user.avatarUrl ? user.avatarUrl : '/assets/whitehat.jpg'})`}} className="simpleProfileImg"></div>
        </div>       
            <div className="simpleProfileModalUsername">{user.userName}</div>
            <div className="simpleProfileModalQuote">{'"'+user.quote+'"'}</div>	
            <div className="simpleProfileModalOwnerOf">{user.mySurkl ? 'Owner of '+user.mySurkl.name : ''}</div>	
            <div className="simpleProfileModalMemberOf">{user.memberOf ? 'Member of '+user.memberOf.name : ''}</div>	
            <div className="simpleProfileModalActions">
              {/* <div onClick={()=>openDMs(user, props.id)} data-user={JSON.stringify(user)}  className="simpleModalAction simple-send-msg-action">Send a Message</div> */}
            </div>   
      </div>
      )
    	
  } else {
    return <div></div>
  }
}

ProfileModal.propTypes = {
  user: PropTypes.object,
  hideProfileModal: PropTypes.func,
  openDMs: PropTypes.func,
  sendDM: PropTypes.func,
  position: PropTypes.object,
  id: PropTypes.string,
}
export default ProfileModal
