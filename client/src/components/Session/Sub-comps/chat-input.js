import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {emojis} from 'components/Dashboard/emojis';
class ChatInput extends Component {
  constructor(props){
    super(props)
    this.state = {
      msg: ''
    }
  }
  onInput = (e) =>{
    this.setState({msg: e.target.value})
  }
  sendMsg = (e) =>{
    if (e.key === 'Enter') {
     e.preventDefault();
     this.props.sendMsg(this.state.msg)
     this.setState({msg:''})
    }   
  }
  displayEmojis = () => {
		return emojis.map((emoji, ind) => {
			return (
				<div
					onClick={() => this.addEmoji(emoji)}
					className="emoji"
					key={ind}
					style={{
						width: '20px',
						height: '20px',
						padding: '5px'
					}}
				>
					{emoji}
				</div>
			);
		});
  };
  addEmoji = (emoji) => {
		let msg = this.state.msg;
		this.setState({ msg: (msg += emoji) });
		document.getElementById('chatInputBox').focus()
	};
	showEmojiLib = () => {
		document.getElementById('emoji-lib').style.display = 'flex';
	};
	hideEmojiLib = () => {
		document.getElementById('emoji-lib').style.display = 'none';
	};
	render() {
		return (
      <div id="session-chat-controls">
        <textarea
				value={this.state.msg}
				onChange={this.onInput}
				onKeyDown={this.sendMsg}
				name="msg"
				placeholder="Type here to chat"
				id="chatInputBox"
			/>
        <div id="session-chat-btns">
					<div onClick={this.showEmojiLib} id="session-emojis" className="session-chat-btn">
						<div onMouseLeave={this.hideEmojiLib} id="emoji-lib">
							{this.displayEmojis()}
						</div>
					</div>
          <div id="session-gifs" className="session-chat-btn">
              <div></div>
            </div>
        </div>
      </div>
			
		);
	}
}
ChatInput.propTypes = {
  sendMsg: PropTypes.func
}
export default ChatInput;
