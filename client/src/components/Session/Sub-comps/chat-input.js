import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
	render() {
		return (
			<textarea
				value={this.state.msg}
				onChange={this.onInput}
				onKeyDown={this.sendMsg}
				name="msg"
				placeholder="Type here to chat"
				id="chatInputBox"
			/>
		);
	}
}
ChatInput.propTypes = {
  sendMsg: PropTypes.func
}
export default ChatInput;
