import React, { Component } from "react";
import PropTypes from "prop-types";
import { emojis } from "../emojis";
import { connect } from "react-redux";
import "./ChatInput.scss";
class ChatInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      msg: "",
      mentions: [],
      mentionsMemberSearch: "",
      mentionsListVisibility: false,
      filteredMentionList: [],
      originalMentionsList: []
    };
    this.socket = this.props.socket;
    this.mentionsFilterWord = '';
  }
  displayEmojis = () => {
    return emojis.map((emoji, ind) => {
      return (
        <div
          onClick={() => this.addEmoji(emoji)}
          className="emoji"
          key={ind}
          style={{
            width: "20px",
            height: "20px",
            padding: "5px"
          }}
        >
          {emoji}
        </div>
      );
    });
  };
  componentDidUpdate(prevProps) {
    if (this.props.surkl.online !== prevProps.surkl.online) {
      this.setState({
        filteredMentionList: this.props.surkl.online,
        originalMentionsList: this.props.surkl.online
      });
    }
  }
  addEmoji = emoji => {
    let msg = this.state.msg;
    this.setState({ msg: (msg += emoji) });
    document.getElementById("chat-input").focus();
  };
  showEmojiLib = () => {
    document.getElementById("emoji-lib").style.display = "flex";
  };
  hideEmojiLib = () => {
    document.getElementById("emoji-lib").style.display = "none";
  };
  onInput = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  onMsgInput = e => {
    if (this.state.mentionsListVisibility) {
      let original = this.state.originalMentionsList.slice();
      let filtered = original.filter(val => {
        let regex = new RegExp(
          this.mentionsFilterWord.replace("@", ""),
          "g"
        );
        return regex.test(val.userName);
      });
      this.setState({
        filteredMentionList: filtered,
        msg: e.target.value
      });
    } else {
      this.setState({ msg: e.target.value });
    }
  };
  recordKeyForMentionsFilter = key => {
    let invalidKeys = [
      "Shift",
      "Control",
      "CapsLock",
      "Alt",
      "Backspace",
      "Escape",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown"
    ];
    if (invalidKeys.indexOf(key) === -1) {
      this.mentionsFilterWord += key;
    } else if (key === 'Backspace'){
      this.mentionsFilterWord = this.mentionsFilterWord.slice(0, this.mentionsFilterWord.length-1);
    }
    console.log(this.mentionsFilterWord)
  };
  sendMsg = e => {
    if(this.state.mentionsListVisibility){
      this.recordKeyForMentionsFilter(e.key)
    }
    if (
      e.key === " " &&
      this.state.msg.slice(this.state.msg.length - 1) === "@"
    ) {
      this.setState({ mentionsListVisibility: false });
      this.mentionsFilterWord = '';
    }
    if (
      e.key === "Backspace" &&
      this.state.msg.slice(this.state.msg.length - 1) === "@"
    ) {
      this.setState({ mentionsListVisibility: false });
      this.mentionsFilterWord = '';
    }
    if (e.keyCode === 32) {
      this.setState({ mentionsListVisibility: false });
      this.mentionsFilterWord = '';
    }
    if (e.key === "@") {
      if (this.state.msg.slice(this.state.msg.length - 1) === " ") {
        this.triggerMentionsList();
      } else if (this.state.msg.length === 0) {
        this.triggerMentionsList();
      }
    }
    if (e.key === "Enter") {
      e.preventDefault();
      this.props.sendMsg({
        msg: this.state.msg,
        mentions: this.state.mentions
      });
      this.setState({ msg: "", mentions: [], mentionsListVisibility: false });
    }
  };
  mentionsList = () => {
    return this.state.filteredMentionList.map((mem, ind) => {
      return (
        <div
          onClick={() => this.createMention(mem)}
          key={ind}
          className="mention-on-member"
        >
          <img src={mem.avatarUrl} className="mentions-list-avatar" />
          <div>{mem.userName}</div>
        </div>
      );
    });
  };
  triggerMentionsList = () => {
    this.setState({ mentionsListVisibility: true });
  };
  // arrowThroughMentionsList = (direction) =>{
  // 	let mentionsList = document.getElementById('mention-on-members-list');
  // 	if(direction==="up"){

  // 	}

  // }
  createMention = user => {
    let name = this.state.mentionFilterChars;
    let mentions = this.state.mentions;
    mentions.push(user);
    name += user.userName;
    this.setState({ name, mentionsListVisibility: false });
    document.getElementById("chat-input").focus();
  };
  render() {
    return (
      <div id="chat-controls">
        <div
          style={{
            display: this.state.mentionsListVisibility ? "block" : "none"
          }}
          id="mention-on-members-list"
        >
          {/*<input id="mentions-member-search" onChange={this.onInput} name='mentionsMemberSearch' value={this.state.mentionsMemberSearch} type="text"/>*/}
          {this.mentionsList()}
        </div>
        <textarea
          value={this.state.msg}
          onKeyDown={this.sendMsg}
          onChange={this.onMsgInput}
          name="msg"
          placeholder="Type here to chat, press @ for mentions"
          id="chat-input"
        />

        <div id="chat-btns">
          <div
            onClick={this.showEmojiLib}
            id="chat-emojis"
            className="chat-btn"
          >
            <div onMouseLeave={this.hideEmojiLib} id="emoji-lib">
              {this.displayEmojis()}
            </div>
          </div>

          {
            <label
              className="chat-btn"
              id="file-up-icon"
              htmlFor="chat-file-up"
            >
              <input
                accept="image/*"
                onChange={this.props.uploadFile}
                name="file-up"
                type="file"
                id="chat-file-up"
              />
            </label>
          }
        </div>
      </div>
    );
  }
}
ChatInput.propTypes = {
  sendMsg: PropTypes.func,
  uploadFile: PropTypes.func,
  surkl: PropTypes.object,
  socket: PropTypes.object
};
function stateToProps(state) {
  return {
    surkl: state.surkl
  };
}
export default connect(stateToProps)(ChatInput);
