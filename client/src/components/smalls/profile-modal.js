import React from 'react';
import "styles/profile-modal.scss";
import PropTypes from 'prop-types';
function ProfileModal(props) {
  let user = props.profileModal.user;
  let styles = {
    top:props.profileModal.pos[1]-250+'px',
    left:props.profileModal.pos[0]+'px',
    display: props.profileModal.vis ? 'block' : 'none'
  }
  return (
    <div onMouseLeave={props.hideProfileModal} style={styles} className="profileModal">
      <div className="profileBanner">
        <div style={{backgroundImage:`url(${user.avatar ? user.avatar : '/assets/whitehat.jpg'})`}} className="profileImg"></div>
      </div>       
          <div className="profileModalUsername">{user.userName}</div>
          <div className="profileModalDesc">{user.description}</div>
          <div className="profileModalActions">
            <div className="modalAction">Add To Surkl</div>
            <div className="modalAction">Send a Message</div>
          </div>   
    </div>
  )
}

ProfileModal.propTypes = {
  profileModal: PropTypes.object,
  hideProfileModal: PropTypes.func
}
export default ProfileModal
