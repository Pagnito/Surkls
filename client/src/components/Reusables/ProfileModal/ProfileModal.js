import React from "react";
import "./ProfileModal.scss";
import PropTypes from "prop-types";
function ProfileModal(props) {
  let {user, position, triangle, openDMs, addToSurkl} = props;
  if (!user.guest) {
    if (props.simple) {
      return (
          <div style={position} className="profileModal">
            <div style={{display: triangle.top ? 'flex' : 'none'}} className="prof-modal-top-arrow-wrap">
                <div style={triangle.position} className="prof-modal-top-arrow"></div>
              </div>
            <div className="profileBanner">
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
            <div className="profileModalQuote">{'"' + user.quote ? user.quote : '' + '"'}</div>
            <div className="profileModalOwnerOf">
              {user.mySurkl ? "Owner of " + user.mySurkl.name : ""}
            </div>
            <div className="profileModalMemberOf">
              {user.memberOf ? "Member of " + user.memberOf.name : ""}
            </div>
            <div style={{display: triangle.bottom ? 'flex' : 'none'}} className="prof-modal-bottom-arrow-wrap">
                <div style={triangle.position} className="prof-modal-bottom-arrow"></div>
              </div>
        </div>
      )
    } else {
      console.log('bruh')
      let addToSurklBtn = !user.memberOf ? (
        <div
          onClick={() => addToSurkl(user, user.mySurkl)}
          className="modalAction add-to-surkl-action"
        >
          <div id="feedback-ani-1">Sent</div>
          Add To Surkl
        </div>
      ) : (
        ""
      );
     
        let askAdminBtn = user.isAdmin ? (
          <div className="profileModalAskAdmin">Ask for admin rights</div>
        ) : (
          <div className="profileModalPassAdmin">Give admin rights</div>
        );
        //askAdminBtn = user._id === user._id ? "" : askAdminBtn;
        return (
          <div style={position} className="profileModal">
             <div style={{display: triangle.top ? 'flex' : 'none'}} className="prof-modal-top-arrow-wrap">
                <div style={triangle.position} className="prof-modal-top-arrow"></div>
              </div>
            <div className="profileBanner">
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
                onClick={() => openDMs(user)}
                data-user={JSON.stringify(user)}
                className="modalAction send-msg-action"
              >
                Send a Message
              </div>
              {askAdminBtn}
            </div>
           
            <div style={{display: triangle.bottom ? 'flex' : 'none'}} className="prof-modal-bottom-arrow-wrap">
                <div style={triangle.position} className="prof-modal-bottom-arrow"></div>
              </div>
          </div>
        );
      
    }
  } else {
    return <div></div>;
  }
}

ProfileModal.propTypes = {
  user: PropTypes.object,
  hideProfileModal: PropTypes.func,
  openDMs: PropTypes.func,
  addToSurkl: PropTypes.func,
  pointing: PropTypes.string,
  position: PropTypes.object,
  triangle: PropTypes.object
};
export default ProfileModal;
