import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { emojis } from './emojis';
import {connect} from 'react-redux';
class ChatInput extends Component {
	constructor(props) {
		super(props);
		this.state = {
			msg: '',
			mentions: []
		};
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
		document.getElementById('surkl-chat-input').focus()
	};
	showEmojiLib = () => {
		document.getElementById('emoji-lib').style.display = 'flex';
	};
	hideEmojiLib = () => {
		document.getElementById('emoji-lib').style.display = 'none';
	};

	onInput = (e) => {
		this.setState({ msg: e.target.value });
	};
	sendMsg = (e) => {
		if(e.key===' ' && this.state.msg.slice(this.state.msg.length-1)==='@'){
			document.getElementById('mention-on-members-list').style.display = 'none';
		}
		if(e.key==='Backspace' && this.state.msg.slice(this.state.msg.length-1)==='@'){
			document.getElementById('mention-on-members-list').style.display = 'none';
		}
		if(e.key==='@'){
			if(this.state.msg.slice(this.state.msg.length-1)===' '){
				this.triggerMentionsList()
			} else if(this.state.msg.length===0){
				this.triggerMentionsList()
			}	
		}
		if (e.key === 'Enter') {
			e.preventDefault();
			this.props.sendMsg({msg:this.state.msg, mentions:this.state.mentions});
			this.setState({ msg: '' ,
			 						mentions: []});
		}
	};
	mentionsList = () => {
		let onMembers = this.props.surkl.online
		if(onMembers){
			return onMembers.map((mem,ind)=>{
				return (
					<div onClick={()=>this.createMention(mem)} key={ind} className="mention-on-member">
						<img src={mem.avatarUrl} className="mentions-list-avatar"/>
						<div>{mem.userName}</div>
					</div>
				)
			})
		}
	}
	triggerMentionsList = () => {
		let mentionsList = document.getElementById('mention-on-members-list');
		mentionsList.style.display = "block"
		//mentionsList.firstChild.focus();
	}
	createMention = (user) =>{
		let msg = this.state.msg;
		let mentions = this.state.mentions;
		mentions.push(user);
		msg+=user.userName
		this.setState({msg})
		document.getElementById('mention-on-members-list').style.display = 'none';
		document.getElementById('surkl-chat-input').focus()
	}
	render() {
		return (
			<div id="surkl-chat-controls">
				<div id="mention-on-members-list">
					{this.mentionsList()}
				</div>
				<textarea
					value={this.state.msg}
					onKeyDown={this.sendMsg}
					onChange={this.onInput}
					name="msg"
					placeholder="Type here to chat, press @ for mentions"
					id="surkl-chat-input"
				/>

				<div id="surkl-chat-btns">
					<div onClick={this.showEmojiLib} id="surkl-emojis" className="surkl-chat-btn">
						<div onMouseLeave={this.hideEmojiLib} id="emoji-lib">
							{this.displayEmojis()}
						</div>
					</div>

					<label className="surkl-chat-btn" id="file-up-icon" htmlFor="surkl-file-up">
						<input
							accept="image/*"
							onChange={this.props.uploadFile}
							name="file-up"
							type="file"
							id="surkl-file-up"
						/>
					</label>
				</div>
			</div>
		);
	}
}
ChatInput.propTypes = {
	sendMsg: PropTypes.func,
	uploadFile: PropTypes.func,
	surkl: PropTypes.object
};
function stateToProps(state){
	return {
		surkl: state.surkl
	}
}
export default connect(stateToProps)(ChatInput);
