import React from 'react';
import "styles/profile-modal.scss";
import PropTypes from 'prop-types';
function ProfileModal(props) {
  let user = props.user;


  return (
    <div onMouseLeave={props.hideProfileModal} className="profileModal">
      <div className="profileBanner">
        <div style={{backgroundImage:`url(${user.avatarUrl ? user.avatarUrl : '/assets/whitehat.jpg'})`}} className="profileImg"></div>
      </div>       
          <div className="profileModalUsername">{user.userName}</div>
          <div className="profileModalDesc">{user.description}</div>
          <div className="profileModalActions">
            <div className="modalAction">Add To Surkl</div>
            <div data-msgsid={user._id} className="modalAction">Send a Message</div>
          </div>   
    </div>
  )
}

ProfileModal.propTypes = {
  user: PropTypes.object,
  hideProfileModal: PropTypes.func,
  openDMs: PropTypes.func,
  sendDM: PropTypes.func
}
export default ProfileModal
