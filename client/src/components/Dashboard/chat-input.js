import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { emojis } from './emojis';
class ChatInput extends Component {
	constructor(props) {
		super(props);
		this.state = {
			msg: ''
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
		if (e.key === 'Enter') {
			e.preventDefault();
			this.props.sendMsg(this.state.msg);
			this.setState({ msg: '' });
		}
	};
	
	render() {
		return (
			<div id="surkl-chat-controls">
				<textarea
					value={this.state.msg}
					onKeyDown={this.sendMsg}
					onChange={this.onInput}
					name="msg"
					placeholder="Type here to chat"
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
	uploadFile: PropTypes.func
};
export default ChatInput;
