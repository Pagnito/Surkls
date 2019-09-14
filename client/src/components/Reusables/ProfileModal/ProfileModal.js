import React from "react";
import "styles/ProfileModal.scss";
import PropTypes from "prop-types";
function ProfileModal(props) {
  let user = props.user;

  if (!user.guest) {
    if (props.simple) {
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
      let addToSurklBtn = !user.memberOf ? (
        <div
          onClick={() => this.addToSurkl(user, this.props.auth.user.mySurkl)}
          className="modalAction add-to-surkl-action"
        >
          <div id="feedback-ani-1">Sent</div>
          Add To Surkl
        </div>
      ) : (
        ""
      );
      if (user._id !== this.props.auth.user._id) {
        let askAdminBtn = user.isAdmin ? (
          <div className="profileModalPassAdmin">Ask for admin rights</div>
        ) : (
          <div className="profileModalPassAdmin">Give admin rights</div>
        );
        askAdminBtn = user._id === this.props.auth.user._id ? "" : askAdminBtn;
        return (
          <div className="profileModal">
            <div className="profileBanner">
              <div className="prof-modal-top-arrow-wrap">
                <div className="prof-modal-top-arrow"></div>
              </div>
              <div
                style={{
                  backgroundImage: `url(${
                    user.avatarUrl ? user.avatarUrl : "/assets/whitehat.jpg"
                  })`
                }}
                className="profileImg"
              ></div>
            </div>
            <div className="profileModalUsername">{user.userName}</div>
            <div className="profileModalQuote">{'"' + user.quote + '"'}</div>
            <div className="profileModalOwnerOf">
              {user.mySurkl ? "Owner of " + user.mySurkl.name : ""}
            </div>
            <div className="profileModalMemberOf">
              {user.memberOf ? "Member of " + user.memberOf.name : ""}
            </div>
            <div className="profileModalActions">
              {addToSurklBtn}
              <div
                onClick={() => this.openDMs(user)}
                data-user={JSON.stringify(user)}
                className="modalAction send-msg-action"
              >
                Send a Message
              </div>
              {askAdminBtn}
            </div>
          </div>
        );
      }
    }
  } else {
    return <div></div>;
  }
}

ProfileModal.propTypes = {
  user: PropTypes.object,
  hideProfileModal: PropTypes.func,
  openDMs: PropTypes.func,
  sendDM: PropTypes.func,
  pointing: PropTypes.string
};
export default ProfileModal;
