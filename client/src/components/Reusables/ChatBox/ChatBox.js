import React, { Component } from "react";
import ChatFeed from './ChatFeed/ChatFeed';
import { connect } from 'react-redux';
import { updateMsgs } from 'actions/chat-actions'
import { writeData } from 'tools/sw-utils';
import ChatInput from './ChatInput/ChatInput';
import propTypes from 'prop-types';
import './ChatBox.scss';
class ChatBox extends Component {
  constructor(props){
    super(props);
    this.socket = this.props.socket
		this.socket.on('receive-'+this.props.type+'-msgs', (msgs) => {
			this.props.updateMsgs(msgs, this.props.type);
    });
    this.chunkSize = 4024;
		this.chunksSent = 0;
		this.bufferedFile;
		this.sharedFileReader;
		this.sharingFileStarted = false;
		this.socket.on(this.props.type + '-sharing-file', (buffer, size, msgObj) => {
			if (this.sharingFileStarted === false) {
				this.sharingFileStarted = true;
				this.sharedFileBuffers = [];
				this.progressPercent = 0;				
				this.amountOfChunks = size / this.chunkSize;
				this.percentPerChunk =this.amountOfChunks> 100 ? 100/this.amountOfChunks : 1/(this.amountOfChunks/100);
				
				this.progressBar = document.getElementById('file-upload-progress');
			}
			if (size === 'end-of-file') {
				this.progressBar.style.width = '0%';
				this.sharingFileStarted = false;
				let newFile = new Blob(this.sharedFileBuffers);
				let msgsClone = this.props[this.props.type].msgs.slice(0);
				msgsClone.push(msgObj)
				this.props.updateMsgs(msgsClone, this.props.type)
				let fileObj = {
					id: msgObj.image_id,
					file: newFile,
					size: newFile.size
				}
				writeData(this.props.type+'-chat-media', fileObj)

			} else {
				this.sharedFileBuffers.push(buffer);		
				this.progressPercent += this.percentPerChunk;
				if(this.progressPercent>100){
					this.progressPercent = 100
				}
				this.progressBar.style.width = this.progressPercent + '%';	
			}
		});
  }
  componentWillUnmount() {
		this.socket.removeListener(this.props.type + '-sharing-file');
		this.socket.removeListener('receive-'+this.props.type+ '-msgs');
	}
  /////////////////////upload file///////////////////
  dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), 
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  }
	resizeImage = (blob) => {
		let canvas = document.createElement('canvas');
		let reader = new FileReader();
		let resizedImage;
		return new Promise((resolve)=>{
			reader.onload =  (readerEvent) =>{
				let image = new Image();
				image.onload = () => {
								let max_size = 550,
								width = image.width,
								height = image.height;
						if (width > height) {
								if (width > max_size) {
										height *= max_size / width;
										width = max_size;
								}
						} else {
								if (height > max_size) {
										width *= max_size / height;
										height = max_size;
								}
						}
						canvas.width = width;
						canvas.height = height;
						canvas.getContext('2d').drawImage(image, 0, 0, width, height);
						let dataUrl = canvas.toDataURL('image/png');
						resizedImage = this.dataURLtoBlob(dataUrl);
						resolve(resizedImage)
				}
				image.src = readerEvent.target.result;
		}
		reader.readAsDataURL(blob);
	})
		
};
	uploadFile = (ev) => {	
		let file = ev.target.files[0];
		this.resizeImage(file).then((img)=>{
			let reader = new FileReader();
			let fileSize = img.size;
			this.sendChunk(reader, img, fileSize);
		})
	};
	sendChunk = (reader, file, size) => {
		let id = this.props.match.params.id.indexOf('=') > -1 ? this.props.match.params.id.split("=")[1] : this.props.match.params.id
		reader.onload = (e) => {
			this.socket.emit(this.props.type + '-file', e.target.result, id, size, 'buffering');
			this.chunksSent += this.chunkSize;
			if (e.target.result.byteLength===this.chunkSize) {
				this.sendChunk(reader, file, size);
			} else {
				let msgObj = {
					user_id: this.props.auth.user._id,
					image_id: Math.random().toString(36).substring(2, 15),
					userName: this.props.auth.user.userName,
					avatarUrl: this.props.auth.user.avatarUrl,
					[this.props.type+'_id']: id,
					date: Date.now()
				};
				this.socket.emit(this.props.type + '-file', e.target.result, id, size, 'end-of-file', msgObj);
				this.chunksSent = 0;
			}
		};
		reader.readAsArrayBuffer(file.slice(this.chunksSent, this.chunksSent + this.chunkSize));
  };
   /////////////////////upload file///////////////////
  sendMsg = (msg) =>{
		let id = this.props.match.params.id.indexOf('=') > -1 ? this.props.match.params.id.split("=")[1] : this.props.match.params.id;
		let msgObj;
		let msgs = this.props[this.props.type].msgs

		if(this.props.auth.isAuthenticated){
			msgObj =	{
				msg: msg.msg,
				user_id: this.props.auth.user._id,
				userName: this.props.auth.user.userName,
				avatarUrl: this.props.auth.user.avatarUrl,
				[this.props.type+'_id']: id,
				mentions: msg.mentions,
				date: Date.now()
			} 
			if(msgs.length > 0 && msgs[msgs.length-1].user_id===this.props.auth.user._id && msg.mentions.length===0){
				msgObj = {
					msg:msg.msg, 
					[this.props.type+'_id']: id,
					user_id: this.props.auth.user._id,
					mentions: msg.mentions,
				}
			}
		} else {	
			msgObj =	{
				msg: msg.msg,
				user_id: this.props.auth.guest._id,
				userName: this.props.auth.guest.userName,
				avatarUrl: this.props.auth.guest.avatarUrl,
				[this.props.type+'_id']: id,
				mentions: msg.mentions,
				date: Date.now()
		}	
		if(msgs.length > 0 && msgs[msgs.length-1].user_id===this.props.auth.guest._id && msg.mentions.length===0){
			msgObj = {
				msg:msg.msg, 
				[this.props.type+'_id']: id,
				user_id: this.props.auth.guest._id,
				mentions: msg.mentions,
			}
		}
	}
	this.socket.emit(this.props.type + '-msg', msgObj);
}
  render() {
    let { type } = this.props;
    return (
      <section id="chat-box">
        <ChatFeed msgs={this.props[type].msgs} type={this.props.type} />
        <div id="file-upload-progress" />
        <ChatInput members={type === "session" ? this.props.session.clients : this.props.surkl.online} match={this.props.match} uploadFile={this.uploadFile} sendMsg={this.sendMsg} socket={this.props.socket}
        />
      </section>
    );
  }
}
ChatBox.propTypes = {
  type: propTypes.string,
  height: propTypes.number,
  width: propTypes.number,
  socket: propTypes.object,
  session: propTypes.object,
  surkl: propTypes.object,
  updateMsgs: propTypes.func,
  auth: propTypes.object,
  match: propTypes.object
}
function stateToProps(state) {
  return {
    surkl: state.surkl,
    session: state.session,
    auth: state.auth
  }
}
export default connect(stateToProps, {updateMsgs})(ChatBox);
